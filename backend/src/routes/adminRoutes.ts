import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { protect, requireAdmin } from "../middleware/auth";
import {
  getAllUsers,
  toggleBlockUser,
  getAllProducts,
  deleteProductAdmin,
  getAllOrders,
} from "../controllers/adminController";

const router = Router();

router.use(protect, requireAdmin);
router.get("/users", asyncHandler(getAllUsers));
router.put("/users/:id/block", asyncHandler(toggleBlockUser));
router.get("/products", asyncHandler(getAllProducts));
router.delete("/products/:id", asyncHandler(deleteProductAdmin));
router.get("/orders", asyncHandler(getAllOrders));

export default router;