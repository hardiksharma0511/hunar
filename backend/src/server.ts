import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

dotenv.config();

import { connectDB } from "./config/db";
import { notFound, errorHandler } from "./middleware/errorHandler";
import { generalLimiter, authLimiter } from "./middleware/rateLimit";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import contactRoutes from "./routes/contactRoutes";
import adminRoutes from "./routes/adminRoutes";

const app = express();

// --- Core middleware ---
app.use(helmet()); // sets a batch of protective HTTP headers
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize()); // strips $ and . from user input to block NoSQL injection
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}
app.use(generalLimiter);

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Hunar API is running" });
});

// --- Routes ---
// Auth gets its own stricter rate limit on top of the general one, since
// login/OTP/password-reset are exactly what a brute-force attempt targets.
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/contact", authLimiter, contactRoutes);
app.use("/api/admin", adminRoutes);

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Hunar API listening on port ${PORT}`);
  });
});

export default app;