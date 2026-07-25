import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "buyer" | "seller";
  avatar?: string;
  phone?: string;
  address?: string;
  // Seller-only "Meet the Artisan" profile fields
  sellerProfile?: {
    city: string;
    craft: string;
    story: string;
    specialization: string;
    yearsOfExperience: number;
    photo: string;
    socialLinks?: {
      instagram?: string;
      facebook?: string;
      whatsapp?: string;
      website?: string;
    };
  };
  wishlist: Types.ObjectId[];
  // Email verification (OTP-based, sent via Gmail SMTP)
  isVerified: boolean;
  emailOtp?: string;
  emailOtpExpires?: Date;
  // Platform moderation
  isAdmin: boolean;
  isBlocked: boolean;
  lastOrdersCheckedAt?: Date;
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["buyer", "seller"], default: "buyer" },
    avatar: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    sellerProfile: {
      city: { type: String },
      craft: { type: String },
      story: { type: String },
      specialization: { type: String },
      yearsOfExperience: { type: Number, default: 0 },
      photo: { type: String, default: "" },
      socialLinks: {
        instagram: { type: String, default: "" },
        facebook: { type: String, default: "" },
        whatsapp: { type: String, default: "" },
        website: { type: String, default: "" },
      },
    },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    isVerified: { type: Boolean, default: false },
    emailOtp: { type: String, select: false },
    emailOtpExpires: { type: Date, select: false },
    isAdmin: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    lastOrdersCheckedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Hash the password before saving, only if it was modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export default model<IUser>("User", userSchema);