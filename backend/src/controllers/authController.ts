import { Response } from "express";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";
import { generateOtp, OTP_EXPIRY_MINUTES } from "../utils/otp";
import { sendOtpEmail } from "../utils/sendOtpEmail";
import { sendPasswordResetEmail } from "../utils/sendPasswordResetEmail";
import { verifyRecaptcha } from "../utils/verifyRecaptcha";
import { AuthRequest } from "../types";

const userResponse = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  sellerProfile: user.sellerProfile,
  isVerified: user.isVerified,
  isAdmin: user.isAdmin,
});

// @route POST /api/auth/register
export const register = async (req: AuthRequest, res: Response) => {
  const { name, email, password, role, phone, sellerProfile, recaptchaToken } = req.body;

  const recaptchaOk = await verifyRecaptcha(recaptchaToken);
  if (!recaptchaOk) {
    return res.status(400).json({ success: false, message: "reCAPTCHA verification failed. Please try again." });
  }

  if (role === "seller" && !(phone && phone.trim())) {
    return res.status(400).json({ success: false, message: "A mobile number is required to register as a seller" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: "An account with this email already exists" });
  }

  const otp = generateOtp();
  const user = await User.create({
    name,
    email,
    password,
    role: role === "seller" ? "seller" : "buyer",
    phone: phone || "",
    sellerProfile: role === "seller" ? sellerProfile : undefined,
    emailOtp: otp,
    emailOtpExpires: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
  });

  await sendOtpEmail(email, name, otp);

  res.status(201).json({
    success: true,
    requiresVerification: true,
    email: user.email,
    message: "We've sent a verification code to your email.",
  });
};

// @route POST /api/auth/verify-otp
export const verifyOtp = async (req: AuthRequest, res: Response) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email }).select("+emailOtp +emailOtpExpires");
  if (!user) {
    return res.status(404).json({ success: false, message: "No account found with this email" });
  }
  if (user.isVerified) {
    return res.status(400).json({ success: false, message: "This account is already verified" });
  }
  if (!user.emailOtp || user.emailOtp !== otp) {
    return res.status(400).json({ success: false, message: "Incorrect verification code" });
  }
  if (!user.emailOtpExpires || user.emailOtpExpires.getTime() < Date.now()) {
    return res.status(400).json({ success: false, message: "This code has expired. Please request a new one." });
  }

  user.isVerified = true;
  user.emailOtp = undefined;
  user.emailOtpExpires = undefined;
  await user.save();

  const token = generateToken({ id: user.id, role: user.role });
  res.json({ success: true, token, user: userResponse(user) });
};

// @route POST /api/auth/resend-otp
export const resendOtp = async (req: AuthRequest, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: "No account found with this email" });
  }
  if (user.isVerified) {
    return res.status(400).json({ success: false, message: "This account is already verified" });
  }

  const otp = generateOtp();
  user.emailOtp = otp;
  user.emailOtpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  await user.save();

  await sendOtpEmail(user.email, user.name, otp);
  res.json({ success: true, message: "A new verification code has been sent to your email." });
};

// @route POST /api/auth/forgot-password
export const forgotPassword = async (req: AuthRequest, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: "No account found with this email" });
  }

  const otp = generateOtp();
  user.emailOtp = otp;
  user.emailOtpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  await user.save();

  await sendPasswordResetEmail(user.email, user.name, otp);
  res.json({ success: true, email: user.email, message: "A password reset code has been sent to your email." });
};

// @route POST /api/auth/reset-password
export const resetPassword = async (req: AuthRequest, res: Response) => {
  const { email, otp, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
  }

  const user = await User.findOne({ email }).select("+emailOtp +emailOtpExpires");
  if (!user) {
    return res.status(404).json({ success: false, message: "No account found with this email" });
  }
  if (!user.emailOtp || user.emailOtp !== otp) {
    return res.status(400).json({ success: false, message: "Incorrect reset code" });
  }
  if (!user.emailOtpExpires || user.emailOtpExpires.getTime() < Date.now()) {
    return res.status(400).json({ success: false, message: "This code has expired. Please request a new one." });
  }

  user.password = newPassword; // hashed automatically by the pre-save hook
  user.emailOtp = undefined;
  user.emailOtpExpires = undefined;
  await user.save();

  const token = generateToken({ id: user.id, role: user.role });
  res.json({ success: true, token, user: userResponse(user), message: "Password reset successfully." });
};

// @route POST /api/auth/login
export const login = async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  if (user.isBlocked) {
    return res.status(403).json({ success: false, message: "This account has been suspended. Contact support if you believe this is a mistake." });
  }

  if (!user.isVerified) {
    return res.status(403).json({
      success: false,
      requiresVerification: true,
      email: user.email,
      message: "Please verify your email before logging in.",
    });
  }

  const token = generateToken({ id: user.id, role: user.role });
  res.json({ success: true, token, user: userResponse(user) });
};

// @route GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.json({ success: true, user: userResponse(user) });
};