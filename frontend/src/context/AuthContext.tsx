import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "../lib/axios";
import { User } from "../types";

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: "buyer" | "seller";
  recaptchaToken?: string;
  sellerProfile?: {
    city: string;
    craft: string;
    story: string;
    specialization: string;
    yearsOfExperience: number;
    socialLinks?: {
      instagram?: string;
      facebook?: string;
      whatsapp?: string;
      website?: string;
    };
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  // Registration no longer logs the user in immediately — it sends an OTP
  // and the caller should route to the verify-email page.
  register: (payload: RegisterPayload) => Promise<{ email: string }>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("hunar_user");
    const token = localStorage.getItem("hunar_token");
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  // If the axios layer detects a stale/expired token (server returned 401),
  // reflect that in the UI immediately — e.g. the navbar switches back to
  // "Login / Register" — without forcing a disruptive page navigation.
  useEffect(() => {
    const handleSessionExpired = () => setUser(null);
    window.addEventListener("hunar:session-expired", handleSessionExpired);
    return () => window.removeEventListener("hunar:session-expired", handleSessionExpired);
  }, []);

  const persist = (token: string, user: User) => {
    localStorage.setItem("hunar_token", token);
    localStorage.setItem("hunar_user", JSON.stringify(user));
    setUser(user);
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    persist(data.token, data.user);
  };

  const register = async (payload: RegisterPayload) => {
    const { data } = await api.post("/auth/register", payload);
    return { email: data.email };
  };

  const verifyOtp = async (email: string, otp: string) => {
    const { data } = await api.post("/auth/verify-otp", { email, otp });
    persist(data.token, data.user);
  };

  const resendOtp = async (email: string) => {
    await api.post("/auth/resend-otp", { email });
  };

  const forgotPassword = async (email: string) => {
    await api.post("/auth/forgot-password", { email });
  };

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    const { data } = await api.post("/auth/reset-password", { email, otp, newPassword });
    persist(data.token, data.user);
  };

  const logout = () => {
    localStorage.removeItem("hunar_token");
    localStorage.removeItem("hunar_user");
    setUser(null);
  };

  const updateUser = (updated: User) => {
    localStorage.setItem("hunar_user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyOtp, resendOtp, forgotPassword, resetPassword, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};