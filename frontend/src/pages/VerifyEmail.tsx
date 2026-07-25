import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { WarliDivider } from "../components/decorative/PatternDivider";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, resendOtp } = useAuth();
  const email = (location.state as any)?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  if (!email) {
    return (
      <div className="section-padding container-hunar max-w-md text-center">
        <p className="text-charcoal/60">
          No email to verify. Please <Link to="/register" className="text-terracotta font-medium">register</Link> first.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      await resendOtp(email);
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="section-padding container-hunar max-w-md">
      <div className="text-center mb-8">
        <MailCheck className="w-12 h-12 mx-auto text-terracotta" />
        <h1 className="font-display text-3xl mt-3">Verify Your Email</h1>
        <p className="text-charcoal/60 mt-2 text-sm">
          We sent a 6-digit code to <span className="font-medium text-charcoal">{email}</span>
        </p>
        <WarliDivider className="mt-4" />
      </div>

      <form onSubmit={handleSubmit} className="bg-sand/40 paper-texture rounded-clay p-8 shadow-soft space-y-5">
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        {resent && <p className="text-sm text-olive bg-olive/10 rounded-lg px-3 py-2">A new code has been sent.</p>}

        <div>
          <label className="text-sm font-medium">Verification Code</label>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-terracotta/40"
          />
        </div>

        <Button type="submit" disabled={loading || otp.length !== 6} className="w-full">
          {loading ? "Verifying..." : "Verify & Continue"}
        </Button>

        <p className="text-center text-sm text-charcoal/60">
          Didn't get a code?{" "}
          <button type="button" onClick={handleResend} disabled={resending} className="text-terracotta font-medium">
            {resending ? "Sending..." : "Resend code"}
          </button>
        </p>
      </form>
    </div>
  );
};

export default VerifyEmail;