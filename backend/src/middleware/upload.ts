import multer from "multer";

// Stores files in memory as buffers so they can be streamed straight to
// Cloudinary without ever touching disk.
const storage = multer.memoryStorage();

// Restricted to exactly the image formats the site supports — not just
// "any image/*" (which would also let through things like .svg or .bmp,
// which aren't safe/appropriate for a product photo upload).
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and WEBP images are allowed"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
});