import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Award, Instagram, Facebook, MessageCircle, Globe, BadgeCheck } from "lucide-react";
import api from "../lib/axios";
import { Artisan, Product } from "../types";
import { ProductCard } from "../components/product/ProductCard";
import { Spinner } from "../components/ui/Spinner";
import { WarliDivider } from "../components/decorative/PatternDivider";
import { useAuth } from "../context/AuthContext";

const ArtisanProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/users/artisans/${id}`)
      .then((res) => {
        setArtisan(res.data.artisan);
        setProducts(res.data.products);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner className="py-40" />;
  if (!artisan) return <p className="text-center py-40">Artisan not found.</p>;

  const profile = artisan.sellerProfile;
  const social = profile?.socialLinks;
  const hasSocial = social && (social.instagram || social.facebook || social.whatsapp || social.website);

  const toLink = (platform: "instagram" | "facebook" | "website" | "whatsapp", value: string) => {
    if (!value) return "#";
    if (value.startsWith("http")) return value;
    if (platform === "whatsapp") return `https://wa.me/${value.replace(/[^0-9]/g, "")}`;
    return `https://${value}`;
  };

  return (
    <div className="section-padding container-hunar">
      <div className="bg-sand/40 paper-texture rounded-clay p-8 md:p-12 text-center max-w-2xl mx-auto">
        <img
          src={artisan.avatar || profile?.photo}
          alt={artisan.name}
          className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-ivory shadow-soft"
        />
        <h1 className="font-display text-3xl mt-5 flex items-center justify-center gap-2">
          {artisan.name}
          {artisan.isVerified && (
            <span title="Verified seller" className="inline-flex items-center gap-1 text-xs font-medium text-olive bg-olive/10 px-2 py-0.5 rounded-full">
              <BadgeCheck className="w-3.5 h-3.5" /> Verified
            </span>
          )}
        </h1>
        {profile && (
          <>
            <p className="flex items-center justify-center gap-1.5 text-charcoal/60 mt-2">
              <MapPin className="w-4 h-4" /> {profile.city}
            </p>
            <p className="flex items-center justify-center gap-1.5 text-sm text-terracotta font-medium mt-2">
              <Award className="w-4 h-4" /> {profile.craft} · {profile.yearsOfExperience} years of experience
            </p>
            <p className="text-charcoal/70 mt-5 leading-relaxed">{profile.story}</p>
            <p className="text-sm text-charcoal/50 mt-4 italic">Specializes in {profile.specialization}</p>

            {!user && (
              <p className="text-xs text-charcoal/50 mt-4">
                <Link to="/login" className="text-terracotta font-medium border-b border-terracotta/40">Log in</Link> to see this artisan's direct contact details.
              </p>
            )}

            {user && hasSocial && (
              <div className="flex items-center justify-center gap-4 mt-6">
                {social?.instagram && (
                  <a href={toLink("instagram", social.instagram)} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center hover:bg-terracotta hover:text-ivory transition-colors">
                    <Instagram className="w-4.5 h-4.5" />
                  </a>
                )}
                {social?.facebook && (
                  <a href={toLink("facebook", social.facebook)} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center hover:bg-terracotta hover:text-ivory transition-colors">
                    <Facebook className="w-4.5 h-4.5" />
                  </a>
                )}
                {social?.whatsapp && (
                  <a href={toLink("whatsapp", social.whatsapp)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center hover:bg-terracotta hover:text-ivory transition-colors">
                    <MessageCircle className="w-4.5 h-4.5" />
                  </a>
                )}
                {social?.website && (
                  <a href={toLink("website", social.website)} target="_blank" rel="noopener noreferrer" aria-label="Website" className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center hover:bg-terracotta hover:text-ivory transition-colors">
                    <Globe className="w-4.5 h-4.5" />
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <WarliDivider className="my-14" />

      <h2 className="font-display text-2xl mb-6 text-center">Products by {artisan.name}</h2>
      {products.length === 0 ? (
        <p className="text-center text-charcoal/50">This artisan hasn't listed any products yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default ArtisanProfile;