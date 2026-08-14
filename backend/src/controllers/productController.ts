import { Response } from "express";
import Product from "../models/Product";
import User from "../models/User";
import Category from "../models/Category";
import { AuthRequest } from "../types";

// @route GET /api/products
// Supports: ?search=&category=&state=&minPrice=&maxPrice=&sort=newest|popular|price_asc|price_desc&page=&limit=
export const getProducts = async (req: AuthRequest, res: Response) => {
  const {
    search,
    category,
    state,
    minPrice,
    maxPrice,
    sort = "newest",
    page = "1",
    limit = "12",
    seller,
  } = req.query as Record<string, string>;

  // Public browsing only ever shows approved listings — pending/rejected
  // products stay invisible to everyone except their own seller and admins
  // (see getMyProducts and the admin routes for those views).
  const filter: any = { status: "approved" };

  if (search) {
    filter.$text = { $search: search };
  }
  if (category) {
    filter.categoryName = category;
  }
  if (state) {
    // Loose, case-insensitive match against the seller's city/region so a
    // search like "Rajasthan" or "Uttarakhand" finds products from sellers
    // based there, even though the field stores "City, State".
    filter.sellerCity = { $regex: state, $options: "i" };
  }
  if (seller) {
    filter.seller = seller;
  }
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  let sortOption: any = { createdAt: -1 };
  if (sort === "popular") sortOption = { numReviews: -1, rating: -1 };
  if (sort === "price_asc") sortOption = { price: 1 };
  if (sort === "price_desc") sortOption = { price: -1 };

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("seller", "name sellerProfile.city")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    products,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    total,
  });
};

// @route GET /api/products/featured
export const getFeaturedProducts = async (req: AuthRequest, res: Response) => {
  const products = await Product.find({ isFeatured: true, status: "approved" })
    .populate("seller", "name sellerProfile.city")
    .limit(8);
  res.json({ success: true, products });
};

// @route GET /api/products/:id
// Uses optionalAuth: works for guests, but req.user is populated if a
// valid token is present. Contact details (WhatsApp/Instagram/etc.) are
// only included in the response for logged-in users — a guest sees the
// product fine, just not the seller's direct contact info, which keeps
// it out of reach of anonymous scraping bots.
export const getProductById = async (req: AuthRequest, res: Response) => {
  const product = await Product.findById(req.params.id)
    .populate("seller", "name sellerProfile avatar isVerified")
    .populate("reviews.user", "name avatar");

  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  if (product.status !== "approved") {
    const isOwner = req.user && product.seller && (product.seller as any)._id.toString() === req.user.id;
    let isAdminUser = false;
    if (req.user && !isOwner) {
      const requester = await User.findById(req.user.id).select("isAdmin");
      isAdminUser = !!requester?.isAdmin;
    }
    if (!isOwner && !isAdminUser) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
  }

  const productObj = product.toObject() as any;
  if (!req.user && productObj.seller?.sellerProfile) {
    delete productObj.seller.sellerProfile.socialLinks;
  }

  const related = await Product.find({
    status: "approved",
    $or: [
      { subcategoryName: product.subcategoryName || "__none__" },
      { categoryName: product.categoryName },
    ],
    _id: { $ne: product._id },
  }).limit(4);

  res.json({ success: true, product: productObj, related });
};

// @route POST /api/products  (seller only)
export const createProduct = async (req: AuthRequest, res: Response) => {
  const { name, description, price, discountPrice, images, category, subcategoryName, stock, materials, isFeatured } =
    req.body;

  if (!images || images.length === 0) {
    return res.status(400).json({ success: false, message: "At least one product image is required" });
  }

  // The category dropdown gives the parent Category's ID, and we look up
  // its real name here rather than trusting a client-supplied string —
  // this is what previously let products get mis-tagged with a subcategory
  // name in the field that category browsing actually filters on.
  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) {
    return res.status(400).json({ success: false, message: "Please select a valid category" });
  }

  const seller = await User.findById(req.user!.id).select("sellerProfile.city");

  const product = await Product.create({
    name,
    description,
    price,
    discountPrice,
    images,
    category,
    categoryName: categoryDoc.name,
    subcategoryName: subcategoryName || "",
    sellerCity: seller?.sellerProfile?.city || "",
    stock,
    materials,
    isFeatured: !!isFeatured,
    seller: req.user!.id,
    status: "pending", // every new listing is queued for admin review before going live
  });

  res.status(201).json({
    success: true,
    product,
    message: "Your product has been submitted and will appear once approved by our team.",
  });
};

// @route PUT /api/products/:id  (owning seller only)
export const updateProduct = async (req: AuthRequest, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  if (product.seller.toString() !== req.user!.id) {
    return res.status(403).json({ success: false, message: "You can only edit your own products" });
  }

  // If the category is being changed, re-derive categoryName from the real
  // Category document rather than accepting a client-supplied string.
  if (req.body.category !== undefined) {
    const categoryDoc = await Category.findById(req.body.category);
    if (!categoryDoc) {
      return res.status(400).json({ success: false, message: "Please select a valid category" });
    }
    product.category = req.body.category;
    product.categoryName = categoryDoc.name;
  }

  const fields = ["name", "description", "price", "discountPrice", "images", "subcategoryName", "stock", "materials", "isFeatured"];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) (product as any)[field] = req.body[field];
  });

  await product.save();
  res.json({ success: true, product });
};

// @route DELETE /api/products/:id  (owning seller only)
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  if (product.seller.toString() !== req.user!.id) {
    return res.status(403).json({ success: false, message: "You can only delete your own products" });
  }

  await product.deleteOne();
  res.json({ success: true, message: "Product deleted" });
};

// @route GET /api/products/seller/mine  (seller only)
// Shows every one of the seller's own products regardless of moderation
// status, so they can see what's pending, approved, or was rejected.
export const getMyProducts = async (req: AuthRequest, res: Response) => {
  const products = await Product.find({ seller: req.user!.id }).sort({ createdAt: -1 });
  res.json({ success: true, products });
};

// @route POST /api/products/:id/reviews  (buyer only)
export const addReview = async (req: AuthRequest, res: Response) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user!.id);
  if (alreadyReviewed) {
    return res.status(400).json({ success: false, message: "You already reviewed this product" });
  }

  const reviewer = await User.findById(req.user!.id).select("name");
  const reviewerName = reviewer?.name || "Buyer";

  product.reviews.push({
    user: req.user!.id as any,
    name: reviewerName,
    rating: Number(rating),
    comment,
    createdAt: new Date(),
  });

  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;

  await product.save();
  res.status(201).json({ success: true, product });
};