import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadImages } from "../controllers/uploadController";
import { protect } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

// Any logged-in user can upload — sellers use this for product photos,
// and both buyers and sellers use it for their own profile picture.
router.post("/", upload.array("images", 5), asyncHandler(uploadImages));

export default router;