import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Heart } from "lucide-react";
import { Product } from "../../types";
import { Rating } from "../ui/Rating";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";

export const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const [cartError, setCartError] = useState("");
  const sellerName = typeof product.seller === "object" ? product.seller.name : "";
  const finalPrice = product.discountPrice || product.price;
  const saved = isWishlisted(product._id);
  const outOfStock = product.stock <= 0;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    if (outOfStock) return;
    setCartError("");
    try {
      await addToCart(product._id, 1);
    } catch (err: any) {
      setCartError(err.response?.data?.message || "Could not add to cart");
      setTimeout(() => setCartError(""), 3000);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    await toggleWishlist(product._id);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-sand/50 paper-texture rounded-clay overflow-hidden shadow-soft border border-terracotta/10 group relative"
    >
      <Link to={`/products/${product._id}`}>
        <div className="relative aspect-square overflow-hidden bg-ivory">
          <img
            src={product.images[0]}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${outOfStock ? "grayscale opacity-70" : ""}`}
            loading="lazy"
          />
          {outOfStock ? (
            <span className="absolute top-3 left-3 bg-charcoal/80 text-ivory text-xs px-2.5 py-1 rounded-full">
              Out of Stock
            </span>
          ) : product.discountPrice ? (
            <span className="absolute top-3 left-3 bg-saffron text-ivory text-xs px-2.5 py-1 rounded-full">
              Sale
            </span>
          ) : null}
          <button
            onClick={handleWishlist}
            aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-ivory/90 backdrop-blur flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Heart className={`w-4 h-4 ${saved ? "fill-terracotta text-terracotta" : "text-charcoal/50"}`} />
          </button>
        </div>
        <div className="p-4">
          <p className="text-xs text-charcoal/50 mb-1">{product.subcategoryName || product.categoryName}</p>
          <h3 className="font-display text-lg leading-snug line-clamp-1">{product.name}</h3>
          {sellerName && <p className="text-xs text-charcoal/50 mt-0.5">by {sellerName}</p>}
          <div className="mt-2"><Rating value={product.rating} count={product.numReviews} /></div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-terracotta">₹{finalPrice.toLocaleString("en-IN")}</span>
              {product.discountPrice && (
                <span className="text-xs text-charcoal/40 line-through">₹{product.price.toLocaleString("en-IN")}</span>
              )}
            </div>
            <button
              onClick={handleAdd}
              disabled={outOfStock}
              aria-label={outOfStock ? "Out of stock" : "Add to cart"}
              className="w-9 h-9 rounded-full bg-terracotta text-ivory flex items-center justify-center hover:bg-terracotta/90 transition-colors disabled:bg-charcoal/20 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
          {cartError && <p className="text-xs text-red-600 mt-2">{cartError}</p>}
        </div>
      </Link>
    </motion.div>
  );
};