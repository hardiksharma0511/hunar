import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User as UserIcon, Menu, X, LogOut, LayoutDashboard, Package, ChevronDown, Heart, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import api from "../../lib/axios";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Categories" },
  { to: "/become-seller", label: "Become Seller" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const accountRef = useRef<HTMLDivElement>(null);
  const [unseenOrders, setUnseenOrders] = useState(0);

  // Poll for new orders every 60s while a seller has the site open, so a
  // fresh order shows up as a badge without needing a page refresh.
  useEffect(() => {
    if (!user || user.role !== "seller") {
      setUnseenOrders(0);
      return;
    }
    const check = () => {
      api.get("/orders/seller/unseen-count").then((res) => setUnseenOrders(res.data.count)).catch(() => {});
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Clears the badge the instant the seller opens their Orders tab, instead
  // of waiting for the next 60s poll — SellerDashboard fires this event
  // right after it tells the server the orders have been seen.
  useEffect(() => {
    const clearBadge = () => setUnseenOrders(0);
    window.addEventListener("hunar:orders-seen", clearBadge);
    return () => window.removeEventListener("hunar:orders-seen", clearBadge);
  }, []);

  // Close the account dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-ivory/90 backdrop-blur-md border-b border-terracotta/10">
      <div className="container-hunar px-6 md:px-12 lg:px-20 flex items-center justify-between h-20">
        {/* Logo */}
        <Link to="/" className="flex flex-col shrink-0">
          <span className="font-display text-3xl text-terracotta font-bold italic leading-none">Hunar</span>
          <span className="hidden sm:block text-[10px] tracking-[0.15em] uppercase text-charcoal/45 mt-0.5">
            From their hands to your home
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-terracotta" : "text-charcoal/70 hover:text-terracotta"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Search (desktop) */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xs mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search handmade treasures..."
              className="w-full bg-sand/50 rounded-full pl-9 pr-4 py-2 text-sm placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
            />
          </div>
        </form>

        {/* Icons */}
        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative" aria-label="Cart">
            <ShoppingBag className="w-6 h-6 text-charcoal/80 hover:text-terracotta transition-colors" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-terracotta text-ivory text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative hidden sm:block" ref={accountRef}>
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="relative flex items-center gap-1.5 text-sm font-medium text-charcoal/80 hover:text-terracotta"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <UserIcon className="w-5 h-5" />
                )}
                {user.name.split(" ")[0]}
                <ChevronDown className="w-3.5 h-3.5" />
                {unseenOrders > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-terracotta rounded-full border-2 border-ivory" />
                )}
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-ivory rounded-xl shadow-soft border border-terracotta/10 overflow-hidden py-1">
                  {user.role === "seller" ? (
                    <Link
                      to="/seller/dashboard"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-charcoal/80 hover:bg-sand/50"
                    >
                      <span className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" /> Seller Dashboard
                      </span>
                      {unseenOrders > 0 && (
                        <span className="bg-terracotta text-ivory text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                          {unseenOrders}
                        </span>
                      )}
                    </Link>
                  ) : (
                    <Link
                      to="/orders"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal/80 hover:bg-sand/50"
                    >
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                  )}
                  <Link
                    to="/wishlist"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal/80 hover:bg-sand/50"
                  >
                    <Heart className="w-4 h-4" /> Wishlist
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal/80 hover:bg-sand/50"
                  >
                    <UserIcon className="w-4 h-4" /> Profile Settings
                  </Link>
                  {user.isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal/80 hover:bg-sand/50"
                    >
                      <ShieldCheck className="w-4 h-4" /> Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left border-t border-terracotta/10 mt-1"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-charcoal/80 hover:text-terracotta">
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-terracotta text-ivory px-4 py-2 rounded-full hover:bg-terracotta/90 transition-colors"
              >
                Register
              </Link>
            </div>
          )}

          <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-terracotta/10 bg-ivory px-6 py-4 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search..."
              className="w-full bg-sand/50 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none"
            />
          </form>
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="text-charcoal/80 font-medium">
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to={user.role === "seller" ? "/seller/dashboard" : "/orders"}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-terracotta font-medium"
                >
                  {user.role === "seller" ? "Seller Dashboard" : "My Orders"}
                  {user.role === "seller" && unseenOrders > 0 && (
                    <span className="bg-terracotta text-ivory text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                      {unseenOrders}
                    </span>
                  )}
                </Link>
                <Link to="/wishlist" onClick={() => setOpen(false)} className="text-charcoal/80 font-medium">
                  Wishlist
                </Link>
                <Link to="/profile" onClick={() => setOpen(false)} className="text-charcoal/80 font-medium">
                  Profile Settings
                </Link>
                {user.isAdmin && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="text-charcoal/80 font-medium">
                    Admin Dashboard
                  </Link>
                )}
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 font-medium text-left">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <div className="flex gap-4 pt-2">
                <Link to="/login" onClick={() => setOpen(false)} className="text-charcoal/80 font-medium">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="text-terracotta font-medium">Register</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};