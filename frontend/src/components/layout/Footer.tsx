import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, MapPin, Phone } from "lucide-react";
import { MadhubaniDivider } from "../decorative/PatternDivider";

export const Footer = () => (
  <footer className="bg-charcoal text-ivory/80 mt-24">
    <div className="pt-10 opacity-60">
      <MadhubaniDivider />
    </div>
    <div className="container-hunar px-6 md:px-12 lg:px-20 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
      <div>
        <span className="font-display text-2xl italic text-gold">Hunar</span>
        <p className="mt-1 font-script text-lg text-gold/70">From their hands to your home</p>
        <p className="mt-3 text-sm text-ivory/60 leading-relaxed">
          A marketplace celebrating India's handmade heritage — connecting artisans, painters
          and craftsmen directly with people who value authentic, handcrafted work.
        </p>
        <div className="flex gap-4 mt-4">
          <a href="#" aria-label="Instagram" className="hover:text-gold transition-colors"><Instagram className="w-5 h-5" /></a>
          <a href="#" aria-label="Facebook" className="hover:text-gold transition-colors"><Facebook className="w-5 h-5" /></a>
        </div>
      </div>

      <div>
        <h4 className="font-display text-lg mb-4">Explore</h4>
        <ul className="space-y-2 text-sm text-ivory/60">
          <li><Link to="/products" className="hover:text-gold">All Products</Link></li>
          <li><Link to="/products?category=Traditional Art" className="hover:text-gold">Traditional Art</Link></li>
          <li><Link to="/products?category=Pottery" className="hover:text-gold">Pottery & Ceramics</Link></li>
          <li><Link to="/become-seller" className="hover:text-gold">Become a Seller</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="font-display text-lg mb-4">Company</h4>
        <ul className="space-y-2 text-sm text-ivory/60">
          <li><Link to="/about" className="hover:text-gold">About Hunar</Link></li>
          <li><Link to="/contact" className="hover:text-gold">Contact Us</Link></li>
          <li><Link to="/profile" className="hover:text-gold">My Orders</Link></li>
          <li><Link to="/terms" className="hover:text-gold">Terms & Conditions</Link></li>
          <li><Link to="/privacy" className="hover:text-gold">Privacy Policy</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="font-display text-lg mb-4">Get in Touch</h4>
        <ul className="space-y-3 text-sm text-ivory/60">
          <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gold" /> Ranikhet, Uttarakhand, India</li>
          <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-gold" /> support.hunar@gmail.com</li>
          <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-gold" /> +91 63998 67305</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-ivory/10 py-5 text-center text-xs text-ivory/40">
      © {new Date().getFullYear()} Hunar. Founded by Hardik Sharma. Handmade with care, for India's artisans.
    </div>
  </footer>
);