import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, JwtPayload } from "../types";
import User from "../models/User";

// Verifies the Bearer token on the request and attaches { id, role } to req.user.
export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Not authorized, token invalid or expired" });
  }
};

// Restricts a route to specific roles, e.g. requireRole("seller")
export const requireRole = (...roles: Array<"buyer" | "seller">) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: insufficient permissions" });
    }
    next();
  };
};

// Restricts a route to admin users only. isAdmin isn't stored in the JWT
// (so revoking admin access takes effect immediately without re-issuing
// tokens), so this does a quick DB lookup.
export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
  const user = await User.findById(req.user.id).select("isAdmin");
  if (!user?.isAdmin) {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};