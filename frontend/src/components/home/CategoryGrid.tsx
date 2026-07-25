import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Category } from "../../types";

export const CategoryGrid = ({ categories }: { categories: Category[] }) => (
  <section className="section-padding container-hunar">
    <div className="text-center mb-12">
      <span className="font-script text-2xl text-saffron">Discover</span>
      <h2 className="font-display text-3xl md:text-4xl mt-1">Featured Categories</h2>
      <p className="text-charcoal/60 mt-2 max-w-lg mx-auto">
        From ancient folk art to everyday decor — explore crafts rooted in Indian tradition.
      </p>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
      {categories.map((cat, i) => {
        const Icon = (Icons as any)[cat.icon] || Icons.Sparkles;
        return (
          <motion.div
            key={cat._id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.03 }}
          >
            <Link
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="flex flex-col items-center gap-3 bg-sand/40 hover:bg-sand/70 rounded-clay p-5 text-center transition-colors border border-terracotta/10 h-full"
            >
              <div className="w-14 h-14 rounded-full bg-terracotta/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-terracotta" />
              </div>
              <span className="text-sm font-medium leading-snug">{cat.name}</span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  </section>
);