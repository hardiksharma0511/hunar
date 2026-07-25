import { transporter } from "../config/mailer";
import { OTP_EXPIRY_MINUTES } from "./otp";

// Sends a password reset code. Reuses the same emailOtp/emailOtpExpires
// fields as signup verification — they're single-use codes either way,
// so there's no conflict, just different wording for the right context.
export const sendPasswordResetEmail = async (to: string, name: string, otp: string) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("EMAIL_USER/EMAIL_PASS not configured — skipping password reset email. OTP was:", otp);
    return;
  }

  await transporter.sendMail({
    from: `"Hunar" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset your Hunar password",
    text: `Hi ${name}, your Hunar password reset code is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes. If you didn't request this, you can safely ignore this email.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#A0522D;">Reset your password</h2>
        <p>Hi ${name}, use this code to reset your Hunar password:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color:#2F2A26;">${otp}</p>
        <p style="color:#666; font-size: 13px;">This code expires in ${OTP_EXPIRY_MINUTES} minutes. If you didn't request a password reset, you can safely ignore this email — your password won't be changed.</p>
      </div>
    `,
  });
};