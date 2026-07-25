import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createOrder,
  getMyOrders,
  getSellerOrders,
  getUnseenOrderCount,
  markOrdersSeen,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  markDelivered,
} from "../controllers/orderController";
import { protect, requireRole } from "../middleware/auth";

const router = Router();

router.use(protect);
router.post("/", asyncHandler(createOrder));
router.get("/mine", asyncHandler(getMyOrders));
router.get("/seller", requireRole("seller"), asyncHandler(getSellerOrders));
// These two specific routes must come before "/:id" or Express would treat
// "seller" as an :id value and never reach them.
router.get("/seller/unseen-count", requireRole("seller"), asyncHandler(getUnseenOrderCount));
router.put("/seller/mark-seen", requireRole("seller"), asyncHandler(markOrdersSeen));
router.get("/:id", asyncHandler(getOrderById));
router.put("/:id/status", requireRole("seller"), asyncHandler(updateOrderStatus));
router.put("/:id/cancel", asyncHandler(cancelOrder));
router.put("/:id/mark-delivered", asyncHandler(markDelivered));

export default router;