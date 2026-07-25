import { Response } from "express";
import User from "../models/User";
import Product from "../models/Product";
import { AuthRequest } from "../types";

// @route PUT /api/users/profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const { name, phone, address, avatar, sellerProfile } = req.body;

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (avatar !== undefined) user.avatar = avatar;
  if (sellerProfile && user.role === "seller") {
    user.sellerProfile = { ...user.sellerProfile, ...sellerProfile } as any;
  }

  await user.save();
  res.json({ success: true, user });
};

// @route GET /api/users/artisans
// Public list of sellers for the "Meet Our Artisans" section
export const getArtisans = async (req: AuthRequest, res: Response) => {
  const artisans = await User.find({ role: "seller" }).select(
    "name sellerProfile avatar createdAt isVerified"
  );
  res.json({ success: true, artisans });
};

// @route GET /api/users/wishlist
export const getWishlist = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id).populate({
    path: "wishlist",
    select: "name price discountPrice images rating numReviews stock categoryName",
  });
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, wishlist: user.wishlist });
};

// @route POST /api/users/wishlist/:productId
export const addToWishlist = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const productId = req.params.productId;
  if (!user.wishlist.some((id) => id.toString() === productId)) {
    user.wishlist.push(productId as any);
    await user.save();
  }
  res.json({ success: true, wishlist: user.wishlist });
};

// @route DELETE /api/users/wishlist/:productId
export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.productId) as any;
  await user.save();
  res.json({ success: true, wishlist: user.wishlist });
};
export const getArtisanById = async (req: AuthRequest, res: Response) => {
  const artisan = await User.findOne({ _id: req.params.id, role: "seller" }).select(
    "name sellerProfile avatar createdAt isVerified"
  );
  if (!artisan) return res.status(404).json({ success: false, message: "Artisan not found" });

  const products = await Product.find({ seller: artisan._id }).select(
    "name price discountPrice images rating"
  );

  res.json({ success: true, artisan, products });
};