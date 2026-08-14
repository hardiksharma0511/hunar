import { Response } from "express";
import User from "../models/User";
import Product from "../models/Product";
import Order from "../models/Order";
import Category from "../models/Category";
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

// @route DELETE /api/admin/users/:id
// Removes an obviously fake/spam account. Also cleans up anything they
// listed, so a deleted fake seller doesn't leave orphaned products behind.
export const deleteUserAdmin = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  if (user.isAdmin) return res.status(400).json({ success: false, message: "Cannot delete an admin account" });

  await Product.deleteMany({ seller: user._id });
  await user.deleteOne();
  res.json({ success: true, message: "User and their listings removed" });
};

// @route GET /api/admin/products
export const getAllProducts = async (req: AuthRequest, res: Response) => {
  const products = await Product.find().populate("seller", "name email").sort({ createdAt: -1 });
  res.json({ success: true, products });
};

// @route GET /api/admin/products/pending
// The moderation queue — every product waiting for a decision.
export const getPendingProducts = async (req: AuthRequest, res: Response) => {
  const products = await Product.find({ status: "pending" })
    .populate("seller", "name email sellerProfile.city")
    .sort({ createdAt: 1 });
  res.json({ success: true, products });
};

// @route PUT /api/admin/products/:id/approve
export const approveProduct = async (req: AuthRequest, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  product.status = "approved";
  product.rejectionReason = "";
  await product.save();
  res.json({ success: true, product });
};

// @route PUT /api/admin/products/:id/reject
export const rejectProduct = async (req: AuthRequest, res: Response) => {
  const { reason } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  product.status = "rejected";
  product.rejectionReason = reason || "";
  await product.save();
  res.json({ success: true, product });
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

// --- Category management ---

// @route POST /api/admin/categories
export const createCategory = async (req: AuthRequest, res: Response) => {
  const { name, slug, icon, description, subcategories } = req.body;
  if (!name || !slug) {
    return res.status(400).json({ success: false, message: "Name and slug are required" });
  }

  const existing = await Category.findOne({ $or: [{ name }, { slug }] });
  if (existing) {
    return res.status(400).json({ success: false, message: "A category with that name or slug already exists" });
  }

  const category = await Category.create({
    name,
    slug,
    icon: icon || "Sparkles",
    description: description || "",
    subcategories: subcategories || [],
  });
  res.status(201).json({ success: true, category });
};

// @route PUT /api/admin/categories/:id
export const updateCategory = async (req: AuthRequest, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: "Category not found" });

  const fields = ["name", "slug", "icon", "description", "subcategories"];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) (category as any)[field] = req.body[field];
  });

  await category.save();
  res.json({ success: true, category });
};

// @route DELETE /api/admin/categories/:id
export const deleteCategory = async (req: AuthRequest, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: "Category not found" });

  const productsUsingIt = await Product.countDocuments({ category: category._id });
  if (productsUsingIt > 0) {
    return res.status(400).json({
      success: false,
      message: `Can't delete — ${productsUsingIt} product(s) still use this category.`,
    });
  }

  await category.deleteOne();
  res.json({ success: true, message: "Category deleted" });
};