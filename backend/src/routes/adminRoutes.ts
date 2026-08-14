import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { protect, requireAdmin } from "../middleware/auth";
import {
  getAllUsers,
  toggleBlockUser,
  deleteUserAdmin,
  getAllProducts,
  getPendingProducts,
  approveProduct,
  rejectProduct,
  deleteProductAdmin,
  getAllOrders,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/adminController";

const router = Router();

router.use(protect, requireAdmin);
router.get("/users", asyncHandler(getAllUsers));
router.put("/users/:id/block", asyncHandler(toggleBlockUser));
router.delete("/users/:id", asyncHandler(deleteUserAdmin));

router.get("/products", asyncHandler(getAllProducts));
router.get("/products/pending", asyncHandler(getPendingProducts));
router.put("/products/:id/approve", asyncHandler(approveProduct));
router.put("/products/:id/reject", asyncHandler(rejectProduct));
router.delete("/products/:id", asyncHandler(deleteProductAdmin));

router.get("/orders", asyncHandler(getAllOrders));

router.post("/categories", asyncHandler(createCategory));
router.put("/categories/:id", asyncHandler(updateCategory));
router.delete("/categories/:id", asyncHandler(deleteCategory));

export default router;