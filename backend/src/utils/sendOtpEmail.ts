import { transporter } from "../config/mailer";
import { OTP_EXPIRY_MINUTES } from "./otp";

// Sends the verification code to a new (or re-verifying) user's inbox.
export const sendOtpEmail = async (to: string, name: string, otp: string) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("EMAIL_USER/EMAIL_PASS not configured — skipping OTP email send. OTP was:", otp);
    return;
  }

  await transporter.sendMail({
    from: `"Hunar" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify your Hunar account",
    text: `Hi ${name}, your Hunar verification code is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#A0522D;">Welcome to Hunar, ${name}!</h2>
        <p>Use this code to verify your email address:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color:#2F2A26;">${otp}</p>
        <p style="color:#666; font-size: 13px;">This code expires in ${OTP_EXPIRY_MINUTES} minutes. If you didn't create a Hunar account, you can ignore this email.</p>
      </div>
    `,
  });
};