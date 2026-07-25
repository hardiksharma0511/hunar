import { Response } from "express";
import Order from "../models/Order";
import Cart from "../models/Cart";
import Product from "../models/Product";
import User from "../models/User";
import { sendNewOrderEmail } from "../utils/sendNewOrderEmail";
import { AuthRequest } from "../types";

// @route POST /api/orders  (buyer checkout)
export const createOrder = async (req: AuthRequest, res: Response) => {
  const { shippingAddress, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user: req.user!.id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: "Your cart is empty" });
  }

  // Re-check stock at checkout time, since it may have changed since items
  // were added to the cart (e.g. another buyer purchased the last one).
  const insufficient = cart.items.find((item: any) => item.quantity > item.product.stock);
  if (insufficient) {
    const name = (insufficient.product as any).name;
    const stock = (insufficient.product as any).stock;
    return res.status(400).json({
      success: false,
      message: stock > 0
        ? `Only ${stock} of "${name}" left in stock. Please update your cart.`
        : `"${name}" just went out of stock. Please remove it from your cart.`,
    });
  }

  const orderItems = cart.items.map((item: any) => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.images[0],
    price: item.product.discountPrice || item.product.price,
    quantity: item.quantity,
    seller: item.product.seller,
  }));

  const itemsTotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee = itemsTotal > 999 ? 0 : 79;
  const totalAmount = itemsTotal + shippingFee;

  const order = await Order.create({
    buyer: req.user!.id,
    items: orderItems,
    shippingAddress,
    paymentMethod: paymentMethod || "Cash on Delivery",
    itemsTotal,
    shippingFee,
    totalAmount,
  });

  // Reduce stock for each purchased product
  await Promise.all(
    orderItems.map((item) =>
      Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } })
    )
  );

  cart.items = [];
  await cart.save();

  // Notify each seller whose products are in this order — grouped so each
  // seller only sees their own items, not the buyer's whole cart.
  const itemsBySeller = new Map<string, typeof orderItems>();
  for (const item of orderItems) {
    const sellerId = item.seller.toString();
    if (!itemsBySeller.has(sellerId)) itemsBySeller.set(sellerId, []);
    itemsBySeller.get(sellerId)!.push(item);
  }

  const sellers = await User.find({ _id: { $in: Array.from(itemsBySeller.keys()) } }).select("name email");
  await Promise.all(
    sellers.map((seller) =>
      sendNewOrderEmail(
        seller.email,
        seller.name,
        order.id,
        itemsBySeller.get(seller.id)!.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price }))
      ).catch((err) => console.error(`Failed to send order notification to ${seller.email}:`, err))
    )
  );

  res.status(201).json({ success: true, order });
};

// @route GET /api/orders/mine  (buyer's own order history)
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  const orders = await Order.find({ buyer: req.user!.id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
};

// @route GET /api/orders/seller  (orders containing this seller's products)
export const getSellerOrders = async (req: AuthRequest, res: Response) => {
  const orders = await Order.find({ "items.seller": req.user!.id })
    .populate("buyer", "name email")
    .sort({ createdAt: -1 });
  res.json({ success: true, orders });
};

// @route GET /api/orders/seller/unseen-count
// Powers the notification badge — counts orders placed since the seller
// last opened their Orders tab, so they know without checking constantly.
export const getUnseenOrderCount = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id).select("lastOrdersCheckedAt");
  const since = user?.lastOrdersCheckedAt || new Date(0);

  const count = await Order.countDocuments({
    "items.seller": req.user!.id,
    createdAt: { $gt: since },
  });

  res.json({ success: true, count });
};

// @route PUT /api/orders/seller/mark-seen
export const markOrdersSeen = async (req: AuthRequest, res: Response) => {
  await User.findByIdAndUpdate(req.user!.id, { lastOrdersCheckedAt: new Date() });
  res.json({ success: true });
};

// @route GET /api/orders/:id
export const getOrderById = async (req: AuthRequest, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  const isBuyer = order.buyer.toString() === req.user!.id;
  const isSeller = order.items.some((i) => i.seller.toString() === req.user!.id);
  if (!isBuyer && !isSeller) {
    return res.status(403).json({ success: false, message: "Not authorized to view this order" });
  }

  res.json({ success: true, order });
};

// @route PUT /api/orders/:id/status  (seller updates status of their items' order)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { status, trackingId, courierName } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  const isSeller = order.items.some((i) => i.seller.toString() === req.user!.id);
  if (!isSeller) {
    return res.status(403).json({ success: false, message: "Not authorized to update this order" });
  }

  const effectiveTrackingId = trackingId !== undefined ? trackingId : order.trackingId;
  if (status === "shipped" && !(effectiveTrackingId && effectiveTrackingId.trim())) {
    return res.status(400).json({
      success: false,
      message: "Please add a tracking ID before marking this order as shipped",
    });
  }

  if (status) order.status = status;
  if (trackingId !== undefined) order.trackingId = trackingId;
  if (courierName !== undefined) order.courierName = courierName;

  await order.save();
  res.json({ success: true, order });
};

// @route PUT /api/orders/:id/mark-delivered  (buyer confirms they received their order)
export const markDelivered = async (req: AuthRequest, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  if (order.buyer.toString() !== req.user!.id) {
    return res.status(403).json({ success: false, message: "You can only confirm your own orders" });
  }

  if (order.status !== "shipped") {
    return res.status(400).json({ success: false, message: "Only shipped orders can be marked as delivered" });
  }

  order.status = "delivered";
  await order.save();
  res.json({ success: true, order });
};

// @route PUT /api/orders/:id/cancel  (buyer cancels their own order, only before it ships)
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  if (order.buyer.toString() !== req.user!.id) {
    return res.status(403).json({ success: false, message: "You can only cancel your own orders" });
  }

  if (!["placed", "processing"].includes(order.status)) {
    return res
      .status(400)
      .json({ success: false, message: `This order is already ${order.status} and can no longer be cancelled` });
  }

  order.status = "cancelled";
  await order.save();

  // Restore stock for the cancelled items
  await Promise.all(
    order.items.map((item) => Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } }))
  );

  res.json({ success: true, order });
};