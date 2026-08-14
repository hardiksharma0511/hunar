import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import api from "../lib/axios";
import { Product, Category } from "../types";
import { ProductCard } from "../components/product/ProductCard";
import { Spinner } from "../components/ui/Spinner";
import { WarliDivider } from "../components/decorative/PatternDivider";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const state = searchParams.get("state") || "";
  const sort = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { sort };
    if (search) params.search = search;
    if (category) params.category = category;
    if (state) params.state = state;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    api
      .get("/products", { params })
      .then((res) => setProducts(res.data.products))
      .finally(() => setLoading(false));
  }, [search, category, state, sort, minPrice, maxPrice]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  return (
    <div className="section-padding container-hunar">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl">
          {search ? `Results for "${search}"` : category ? category : "All Handmade Products"}
        </h1>
        <p className="text-charcoal/60 mt-2">{products.length} products found</p>
        <WarliDivider className="mt-6" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <button
            className="lg:hidden flex items-center gap-2 mb-4 text-sm font-medium text-terracotta"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>

          <div className={`${showFilters ? "block" : "hidden"} lg:block bg-sand/40 rounded-clay p-5 space-y-6`}>
            <div>
              <h3 className="font-medium mb-3">Category</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                <button
                  onClick={() => updateParam("category", "")}
                  className={`block text-sm w-full text-left ${!category ? "text-terracotta font-medium" : "text-charcoal/70"}`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => updateParam("category", c.name)}
                    className={`block text-sm w-full text-left ${category === c.name ? "text-terracotta font-medium" : "text-charcoal/70"}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">State / Region</h3>
              <select
                value={state}
                onChange={(e) => updateParam("state", e.target.value)}
                className="w-full rounded-lg border border-terracotta/20 bg-ivory px-3 py-2 text-sm focus:outline-none"
              >
                <option value="">All of India</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="font-medium mb-3">Price Range (₹)</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  defaultValue={minPrice}
                  onBlur={(e) => updateParam("minPrice", e.target.value)}
                  className="w-full rounded-lg border border-terracotta/20 bg-ivory px-3 py-2 text-sm focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  defaultValue={maxPrice}
                  onBlur={(e) => updateParam("maxPrice", e.target.value)}
                  className="w-full rounded-lg border border-terracotta/20 bg-ivory px-3 py-2 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Sort By</h3>
              <select
                value={sort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="w-full rounded-lg border border-terracotta/20 bg-ivory px-3 py-2 text-sm focus:outline-none"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <Spinner className="py-24" />
          ) : products.length === 0 ? (
            <p className="text-center text-charcoal/60 py-24">No products match your filters. Try a different search.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;