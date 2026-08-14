import { Schema, model, Document, Types } from "mongoose";

export interface IReview {
  user: Types.ObjectId;
  name: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: Types.ObjectId;
  categoryName: string;
  subcategoryName?: string;
  seller: Types.ObjectId;
  sellerCity?: string; // denormalized from the seller's profile at listing time, so
                        // buyers can search/filter products by region (e.g. "Rajasthan")
                        // without an extra lookup on every product search.
  stock: number;
  materials: string[];
  rating: number;
  numReviews: number;
  reviews: IReview[];
  isFeatured: boolean;
  // Moderation: every new listing starts pending and only becomes publicly
  // visible once an admin approves it, so spam/inappropriate uploads never
  // reach the storefront.
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    images: [{ type: String, required: true }],
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    categoryName: { type: String, required: true },
    subcategoryName: { type: String, default: "" },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sellerCity: { type: String, default: "" },
    stock: { type: Number, required: true, default: 1, min: 0 },
    materials: [{ type: String }],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

productSchema.index({
  name: "text",
  description: "text",
  categoryName: "text",
  subcategoryName: "text",
  sellerCity: "text",
  materials: "text",
});

export default model<IProduct>("Product", productSchema);