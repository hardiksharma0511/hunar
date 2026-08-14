import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, ShoppingBag, ShieldCheck, Truck, Heart, HandHeart, BadgeCheck, Instagram, Facebook, MessageCircle, Globe } from "lucide-react";
import api from "../lib/axios";
import { Product } from "../types";
import { Rating } from "../components/ui/Rating";
import { Button } from "../components/ui/Button";
import { ReviewCard } from "../components/product/ReviewCard";
import { ProductCard } from "../components/product/ProductCard";
import { Spinner } from "../components/ui/Spinner";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { WarliDivider } from "../components/decorative/PatternDivider";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [cartError, setCartError] = useState("");

  const load = () => {
    setLoading(true);
    api.get(`/products/${id}`).then((res) => {
      setProduct(res.data.product);
      setRelated(res.data.related);
      setActiveImage(0);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <Spinner className="py-40" />;
  if (!product) return <p className="text-center py-40">Product not found.</p>;

  const seller = typeof product.seller === "object" ? product.seller : null;
  const finalPrice = product.discountPrice || product.price;

  const handleAddToCart = async () => {
    if (!user) return navigate("/login");
    setCartError("");
    try {
      await addToCart(product._id, 1);
    } catch (err: any) {
      setCartError(err.response?.data?.message || "Could not add to cart");
    }
  };

  const handleWishlist = async () => {
    if (!user) return navigate("/login");
    await toggleWishlist(product._id);
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    setSubmittingReview(true);
    setReviewError("");
    try {
      await api.post(`/products/${product._id}/reviews`, { rating: reviewRating, comment: reviewText });
      setReviewText("");
      load();
    } catch (err: any) {
      setReviewError(err.response?.data?.message || "Could not submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="section-padding container-hunar">
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="aspect-square rounded-clay overflow-hidden bg-sand/40 border border-terracotta/10">
            <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 mt-4">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${activeImage === i ? "border-terracotta" : "border-transparent"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-saffron font-medium">
            {product.subcategoryName ? `${product.categoryName} · ${product.subcategoryName}` : product.categoryName}
          </p>
          <h1 className="font-display text-3xl md:text-4xl mt-1">{product.name}</h1>
          <div className="mt-3"><Rating value={product.rating} count={product.numReviews} /></div>

          <div className="flex items-baseline gap-3 mt-4">
            <span className="font-display text-3xl text-terracotta">₹{finalPrice.toLocaleString("en-IN")}</span>
            {product.discountPrice && <span className="text-charcoal/40 line-through">₹{product.price.toLocaleString("en-IN")}</span>}
          </div>

          <p className="text-charcoal/70 mt-6 leading-relaxed">{product.description}</p>

          {product.materials?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {product.materials.map((m) => (
                <span key={m} className="text-xs bg-sand/60 px-3 py-1 rounded-full text-charcoal/60">{m}</span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2.5 bg-olive/10 text-olive rounded-lg px-4 py-2.5 mt-4 w-fit">
            <HandHeart className="w-4 h-4 shrink-0" />
            <p className="text-xs font-medium">
              Most of what you pay goes straight to the artisan who made this — no middlemen.
            </p>
          </div>

          <p className="text-sm mt-4 text-charcoal/60">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          <div className="flex gap-3 mt-6">
            <Button onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1">
              <ShoppingBag className="w-4 h-4" /> Add to Cart
            </Button>
            <button
              onClick={handleWishlist}
              aria-label={isWishlisted(product._id) ? "Remove from wishlist" : "Save to wishlist"}
              className="w-12 h-12 rounded-full border-2 border-terracotta/30 flex items-center justify-center hover:bg-terracotta/10 transition-colors shrink-0"
            >
              <Heart className={`w-5 h-5 ${isWishlisted(product._id) ? "fill-terracotta text-terracotta" : "text-terracotta"}`} />
            </button>
          </div>
          {cartError && <p className="text-sm text-red-600 mt-2">{cartError}</p>}

          <div className="flex gap-6 mt-6 text-xs text-charcoal/50">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-olive" /> Safe Payment</span>
            <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-olive" /> Ships across India</span>
          </div>
        </div>
      </div>

      <WarliDivider className="my-14" />

      {seller && (
        <div className="bg-sand/40 paper-texture rounded-clay p-8 grid md:grid-cols-[auto,1fr] gap-6 items-start">
          <img
            src={seller.sellerProfile?.photo || "https://placehold.co/200x200/E9DCC7/A0522D?text=Artisan"}
            alt={seller.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-ivory"
          />
          <div>
            <span className="font-script text-xl text-saffron">Meet the Artisan</span>
            <h3 className="font-display text-2xl mt-1 flex items-center gap-2">
              {seller.name}
              {seller.isVerified && (
                <span title="Verified seller" className="inline-flex items-center gap-1 text-xs font-medium text-olive bg-olive/10 px-2 py-0.5 rounded-full">
                  <BadgeCheck className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </h3>
            {seller.sellerProfile && (
              <>
                <p className="flex items-center gap-1 text-sm text-charcoal/60 mt-1">
                  <MapPin className="w-4 h-4" /> {seller.sellerProfile.city} · {seller.sellerProfile.yearsOfExperience} yrs experience
                </p>
                <p className="text-sm text-terracotta font-medium mt-1">{seller.sellerProfile.specialization}</p>
                <p className="text-charcoal/70 mt-3 leading-relaxed">{seller.sellerProfile.story}</p>

                {(() => {
                  const social = seller.sellerProfile.socialLinks;
                  const toLink = (platform: "instagram" | "facebook" | "website" | "whatsapp", value: string) => {
                    if (value.startsWith("http")) return value;
                    if (platform === "whatsapp") return `https://wa.me/${value.replace(/[^0-9]/g, "")}`;
                    return `https://${value}`;
                  };
                  const hasSocial = social && (social.instagram || social.facebook || social.whatsapp || social.website);
                  if (!user) {
                    return (
                      <p className="text-xs text-charcoal/50 mt-4">
                        <Link to="/login" className="text-terracotta font-medium border-b border-terracotta/40">Log in</Link> to see this artisan's direct contact details.
                      </p>
                    );
                  }
                  if (!hasSocial) return null;
                  return (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-charcoal/50 uppercase tracking-wide mb-2">Have a question? Contact directly</p>
                      <div className="flex items-center gap-3">
                        {social?.instagram && (
                          <a href={toLink("instagram", social.instagram)} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full bg-terracotta/10 flex items-center justify-center hover:bg-terracotta hover:text-ivory transition-colors">
                            <Instagram className="w-4 h-4" />
                          </a>
                        )}
                        {social?.whatsapp && (
                          <a href={toLink("whatsapp", social.whatsapp)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-9 h-9 rounded-full bg-terracotta/10 flex items-center justify-center hover:bg-terracotta hover:text-ivory transition-colors">
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}
                        {social?.facebook && (
                          <a href={toLink("facebook", social.facebook)} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-full bg-terracotta/10 flex items-center justify-center hover:bg-terracotta hover:text-ivory transition-colors">
                            <Facebook className="w-4 h-4" />
                          </a>
                        )}
                        {social?.website && (
                          <a href={toLink("website", social.website)} target="_blank" rel="noopener noreferrer" aria-label="Website" className="w-9 h-9 rounded-full bg-terracotta/10 flex items-center justify-center hover:bg-terracotta hover:text-ivory transition-colors">
                            <Globe className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
            <Link to={`/artisans/${seller._id}`} className="inline-block mt-4 text-sm font-medium text-terracotta border-b border-terracotta/40">
              View all products by {seller.name} →
            </Link>
          </div>
        </div>
      )}

      <div className="mt-16">
        <h2 className="font-display text-2xl mb-6">Reviews ({product.numReviews})</h2>
        <div className="space-y-4 mb-8">
          {product.reviews.length === 0 && <p className="text-charcoal/50">No reviews yet. Be the first to share your thoughts!</p>}
          {product.reviews.map((r, i) => <ReviewCard key={i} review={r} />)}
        </div>

        <form onSubmit={handleReview} className="bg-ivory rounded-clay p-6 border border-terracotta/10 max-w-lg">
          <h3 className="font-medium mb-3">Write a Review</h3>
          {reviewError && <p className="text-sm text-red-600 mb-2">{reviewError}</p>}
          <div className="flex gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} onClick={() => setReviewRating(n)} className={`w-9 h-9 rounded-full border ${reviewRating >= n ? "bg-gold text-ivory border-gold" : "border-terracotta/20"}`}>
                {n}
              </button>
            ))}
          </div>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
            rows={3}
            placeholder="Share your experience with this product..."
            className="w-full rounded-lg border border-terracotta/20 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
          />
          <Button type="submit" disabled={submittingReview} className="mt-3">
            {submittingReview ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;