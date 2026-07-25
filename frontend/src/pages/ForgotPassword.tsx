import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { WarliDivider } from "../components/decorative/PatternDivider";

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      navigate("/reset-password", { state: { email } });
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not send reset code. Please check the email and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-padding container-hunar max-w-md">
      <div className="text-center mb-8">
        <KeyRound className="w-12 h-12 mx-auto text-terracotta" />
        <h1 className="font-display text-3xl mt-3">Forgot Password</h1>
        <p className="text-charcoal/60 mt-2 text-sm">
          Enter your email and we'll send you a code to reset your password.
        </p>
        <WarliDivider className="mt-4" />
      </div>

      <form onSubmit={handleSubmit} className="bg-sand/40 paper-texture rounded-clay p-8 shadow-soft space-y-5">
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
            placeholder="you@example.com"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Sending..." : "Send Reset Code"}
        </Button>

        <p className="text-center text-sm text-charcoal/60">
          Remembered your password? <Link to="/login" className="text-terracotta font-medium">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;