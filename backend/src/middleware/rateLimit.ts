import rateLimit from "express-rate-limit";

// Strict limiter for sensitive auth actions (login, register, OTP,
// password reset) — these are exactly what someone would try to brute
// force or spam, so they get a much tighter cap than normal browsing.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: "Too many attempts. Please try again in a few minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Light general limiter across the whole API, mainly to blunt scraping
// bots and accidental infinite-loop bugs rather than normal usage.
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});