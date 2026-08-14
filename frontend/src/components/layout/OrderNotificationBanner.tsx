import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PartyPopper, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/axios";

// A persistent banner (not a fading toast) that stays visible across every
// page while a seller has unseen orders — not just a small badge that's
// easy to miss. It clears the moment they open their Orders tab (same
// "hunar:orders-seen" signal SellerDashboard already fires), or if they
// dismiss it manually with the X.
export const OrderNotificationBanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "seller") {
      setCount(0);
      return;
    }
    const check = () => {
      api.get("/orders/seller/unseen-count").then((res) => {
        setCount(res.data.count);
        if (res.data.count > 0) setDismissed(false); // a fresh order un-dismisses the banner
      }).catch(() => {});
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const clear = () => setCount(0);
    window.addEventListener("hunar:orders-seen", clear);
    return () => window.removeEventListener("hunar:orders-seen", clear);
  }, []);

  if (!user || user.role !== "seller" || count === 0 || dismissed) return null;

  return (
    <div className="bg-terracotta text-ivory">
      <div className="container-hunar px-6 md:px-12 lg:px-20 py-2.5 flex items-center justify-between gap-3">
        <button
          onClick={() => navigate("/seller/dashboard")}
          className="flex items-center gap-2 text-sm font-medium hover:underline"
        >
          <PartyPopper className="w-4 h-4 shrink-0" />
          {count === 1 ? "You have a new order!" : `You have ${count} new orders!`} Tap to view.
        </button>
        <button onClick={() => setDismissed(true)} aria-label="Dismiss" className="shrink-0 hover:opacity-70">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};