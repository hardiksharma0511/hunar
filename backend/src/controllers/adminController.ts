import { Response } from "express";
import User from "../models/User";
import Product from "../models/Product";
import Order from "../models/Order";
import { AuthRequest } from "../types";

// @route GET /api/admin/users
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  const users = await User.find().select("name email role isVerified isBlocked isAdmin createdAt").sort({ createdAt: -1 });
  res.json({ success: true, users });
};

// @route PUT /api/admin/users/:id/block
export const toggleBlockUser = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  if (user.isAdmin) return res.status(400).json({ success: false, message: "Cannot block an admin account" });

  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json({ success: true, user: { id: user.id, isBlocked: user.isBlocked } });
};

// @route GET /api/admin/products
export const getAllProducts = async (req: AuthRequest, res: Response) => {
  const products = await Product.find().populate("seller", "name email").sort({ createdAt: -1 });
  res.json({ success: true, products });
};

// @route DELETE /api/admin/products/:id
export const deleteProductAdmin = async (req: AuthRequest, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  await product.deleteOne();
  res.json({ success: true, message: "Product removed" });
};

// @route GET /api/admin/orders
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  const orders = await Order.find().populate("buyer", "name email").sort({ createdAt: -1 });
  res.json({ success: true, orders });
};