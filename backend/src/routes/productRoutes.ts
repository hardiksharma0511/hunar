import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  getProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  addReview,
} from "../controllers/productController";
import { protect, requireRole, optionalAuth } from "../middleware/auth";

const router = Router();

router.get("/", asyncHandler(getProducts));
router.get("/featured", asyncHandler(getFeaturedProducts));
router.get("/seller/mine", protect, requireRole("seller"), asyncHandler(getMyProducts));
router.get("/:id", optionalAuth, asyncHandler(getProductById));
router.post("/", protect, requireRole("seller"), asyncHandler(createProduct));
router.put("/:id", protect, requireRole("seller"), asyncHandler(updateProduct));
router.delete("/:id", protect, requireRole("seller"), asyncHandler(deleteProduct));
router.post("/:id/reviews", protect, asyncHandler(addReview));

export default router;