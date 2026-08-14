import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../lib/axios";
import { Category, Product } from "../../types";
import { Button } from "../ui/Button";
import { ImageUploader } from "./ImageUploader";

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().min(1, "Price is required"),
  discountPrice: z.string().optional(),
  category: z.string().min(1, "Please choose a category"),
  subcategoryName: z.string().min(1, "Please choose a subcategory"),
  stock: z.string().min(1, "Stock is required"),
  materials: z.string().optional(),
  isFeatured: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

interface Props {
  initial?: Product;
  onSubmit: (payload: any) => Promise<void>;
  submitLabel: string;
}

export const ProductForm = ({ initial, onSubmit, submitLabel }: Props) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>(initial?.images || []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          name: initial.name,
          description: initial.description,
          price: String(initial.price),
          discountPrice: initial.discountPrice ? String(initial.discountPrice) : "",
          category: typeof initial.category === "string" ? initial.category : "",
          subcategoryName: initial.subcategoryName || "",
          stock: String(initial.stock),
          materials: initial.materials?.join(", "),
          isFeatured: initial.isFeatured,
        }
      : undefined,
  });

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.categories));
  }, []);

  const selectedCategoryId = watch("category");
  const selectedCategory = categories.find((c) => c._id === selectedCategoryId);

  const submit = async (data: FormData) => {
    if (images.length === 0) {
      setError("Please upload at least one product image");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onSubmit({
        name: data.name,
        description: data.description,
        price: Number(data.price),
        discountPrice: data.discountPrice ? Number(data.discountPrice) : undefined,
        category: data.category,
        subcategoryName: data.subcategoryName,
        stock: Number(data.stock),
        materials: data.materials ? data.materials.split(",").map((m) => m.trim()).filter(Boolean) : [],
        isFeatured: !!data.isFeatured,
        images,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="bg-sand/40 paper-texture rounded-clay p-6 md:p-8 space-y-5 max-w-2xl">
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <div>
        <label className="text-sm font-medium">Product Name</label>
        <input {...register("name")} className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none" />
        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea {...register("description")} rows={4} className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none" />
        {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Price (₹)</label>
          <input {...register("price")} type="number" className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none" />
          {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Discount Price (optional)</label>
          <input {...register("discountPrice")} type="number" className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Category</label>
          <select {...register("category")} className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none">
            <option value="">Select category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Subcategory</label>
          <select {...register("subcategoryName")} className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none">
            <option value="">Select subcategory</option>
            {selectedCategory?.subcategories.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.subcategoryName && <p className="text-xs text-red-600 mt-1">{errors.subcategoryName.message}</p>}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Stock Quantity</label>
        <input {...register("stock")} type="number" className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none" />
        {errors.stock && <p className="text-xs text-red-600 mt-1">{errors.stock.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium">Materials (comma separated)</label>
        <input {...register("materials")} placeholder="Terracotta clay, Natural pigments" className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none" />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Product Images</label>
        <ImageUploader images={images} onChange={setImages} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isFeatured")} className="rounded border-terracotta/30" />
        Feature this product on the homepage
      </label>

      {!initial && (
        <p className="text-xs text-charcoal/50 bg-sand/60 rounded-lg px-3 py-2">
          New listings are reviewed by our team before they go live — this usually takes less than a day.
        </p>
      )}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
};