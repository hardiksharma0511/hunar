import { Request, Response } from "express";
import { transporter } from "../config/mailer";
import { verifyRecaptcha } from "../utils/verifyRecaptcha";

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support.hunar@gmail.com";

// @route POST /api/contact
// Sends the visitor's message straight to Hunar support via Gmail SMTP.
export const sendContactMessage = async (req: Request, res: Response) => {
  const { name, email, message, recaptchaToken } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "Name, email, and message are all required" });
  }

  const recaptchaOk = await verifyRecaptcha(recaptchaToken);
  if (!recaptchaOk) {
    return res.status(400).json({ success: false, message: "reCAPTCHA verification failed. Please try again." });
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.status(500).json({
      success: false,
      message: "Email sending isn't configured on the server yet (missing EMAIL_USER/EMAIL_PASS in .env)",
    });
  }

  await transporter.sendMail({
    from: `"Hunar Contact Form" <${process.env.EMAIL_USER}>`,
    to: SUPPORT_EMAIL,
    replyTo: email,
    subject: `New message from ${name} via Hunar Contact Page`,
    text: `From: ${name} (${email})\n\n${message}`,
    html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message.replace(/\n/g, "<br/>")}</p>`,
  });

  res.json({ success: true, message: "Your message has been sent to our team." });
};