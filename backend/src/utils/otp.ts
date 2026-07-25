// Generates a 6-digit numeric OTP as a string, e.g. "042817"
export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const OTP_EXPIRY_MINUTES = 10;