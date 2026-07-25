import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { WarliDivider } from "../components/decorative/PatternDivider";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormData = z.infer<typeof schema>;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    setLoading(true);
    try {
      await login(data.email, data.password);
      const redirect = (location.state as any)?.from || "/";
      navigate(redirect);
    } catch (err: any) {
      if (err.response?.data?.requiresVerification) {
        navigate("/verify-email", { state: { email: err.response.data.email } });
        return;
      }
      setServerError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-padding container-hunar max-w-md">
      <div className="text-center mb-8">
        <span className="font-script text-2xl text-saffron">Welcome Back</span>
        <h1 className="font-display text-3xl mt-1">Login to Hunar</h1>
        <WarliDivider className="mt-4" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-sand/40 paper-texture rounded-clay p-8 shadow-soft space-y-5">
        {serverError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{serverError}</p>}

        <div>
          <label className="text-sm font-medium">Email</label>
          <input {...register("email")} type="email" className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-terracotta/40" placeholder="you@example.com" />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Password</label>
          <input {...register("password")} type="password" className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-terracotta/40" placeholder="••••••••" />
          {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
          <Link to="/forgot-password" className="block text-right text-xs text-terracotta font-medium mt-1.5">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Logging in..." : "Login"}
        </Button>

        <p className="text-center text-sm text-charcoal/60">
          Don't have an account? <Link to="/register" className="text-terracotta font-medium">Register here</Link>
        </p>
        <p className="text-center text-xs text-charcoal/40">
          Demo login: buyer@hunar.demo / password123
        </p>
      </form>
    </div>
  );
};

export default Login;