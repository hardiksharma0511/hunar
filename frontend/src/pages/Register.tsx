import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Recaptcha } from "../components/ui/Recaptcha";
import { WarliDivider } from "../components/decorative/PatternDivider";

const schema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["buyer", "seller"]),
    phone: z.string().optional(),
    city: z.string().optional(),
    craft: z.string().optional(),
    specialization: z.string().optional(),
    yearsOfExperience: z.string().optional(),
    story: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    whatsapp: z.string().optional(),
    website: z.string().optional(),
  })
  .refine((data) => data.role === "buyer" || (data.city && data.craft), {
    message: "City and craft are required for sellers",
    path: ["city"],
  })
  .refine((data) => data.role === "buyer" || (data.phone && data.phone.trim().length >= 10), {
    message: "A valid mobile number is required for sellers",
    path: ["phone"],
  });
type FormData = z.infer<typeof schema>;

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "buyer" },
  });

  const role = watch("role");

  const onSubmit = async (data: FormData) => {
    setServerError("");
    setLoading(true);
    try {
      const { email } = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        phone: data.phone || undefined,
        recaptchaToken: recaptchaToken || undefined,
        sellerProfile:
          data.role === "seller"
            ? {
                city: data.city || "",
                craft: data.craft || "",
                specialization: data.specialization || "",
                story: data.story || "",
                yearsOfExperience: Number(data.yearsOfExperience) || 0,
                socialLinks: {
                  instagram: data.instagram || "",
                  facebook: data.facebook || "",
                  whatsapp: data.whatsapp || "",
                  website: data.website || "",
                },
              }
            : undefined,
      });
      navigate("/verify-email", { state: { email } });
    } catch (err: any) {
      setServerError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-padding container-hunar max-w-lg">
      <div className="text-center mb-8">
        <span className="font-script text-2xl text-saffron">Join Hunar</span>
        <h1 className="font-display text-3xl mt-1">Create Your Account</h1>
        <WarliDivider className="mt-4" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-sand/40 paper-texture rounded-clay p-8 shadow-soft space-y-5">
        {serverError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{serverError}</p>}

        <div className="flex gap-4">
          <label className={`flex-1 text-center rounded-lg border py-3 cursor-pointer transition-colors ${role === "buyer" ? "border-terracotta bg-terracotta/10" : "border-terracotta/20"}`}>
            <input type="radio" value="buyer" {...register("role")} className="hidden" />
            I'm a Buyer
          </label>
          <label className={`flex-1 text-center rounded-lg border py-3 cursor-pointer transition-colors ${role === "seller" ? "border-terracotta bg-terracotta/10" : "border-terracotta/20"}`}>
            <input type="radio" value="seller" {...register("role")} className="hidden" />
            I'm an Artisan
          </label>
        </div>

        <div>
          <label className="text-sm font-medium">Full Name</label>
          <input {...register("name")} className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-terracotta/40" />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Email</label>
          <input {...register("email")} type="email" className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-terracotta/40" />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Password</label>
          <input {...register("password")} type="password" className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-terracotta/40" />
          {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
        </div>

        {role === "seller" && (
          <div className="space-y-5 border-t border-terracotta/10 pt-5">
            <p className="text-sm font-medium text-terracotta">Artisan Profile</p>
            <div>
              <label className="text-sm font-medium">Mobile Number</label>
              <input {...register("phone")} type="tel" className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none" placeholder="98765 43210" />
              {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
              <p className="text-xs text-charcoal/45 mt-1">Required so buyers and our team can reach you about orders.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">City</label>
                <input {...register("city")} className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none" placeholder="Ranikhet, Uttarakhand" />
                {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Craft</label>
                <input {...register("craft")} className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none" placeholder="Pahari Miniature Painting" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Specialization</label>
              <input {...register("specialization")} className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none" placeholder="Hand-painted ceramic vases" />
            </div>
            <div>
              <label className="text-sm font-medium">Years of Experience</label>
              <input {...register("yearsOfExperience")} type="number" className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium">Your Story</label>
              <textarea {...register("story")} rows={3} className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none" placeholder="Tell buyers about your craft journey..." />
            </div>

            <div className="border-t border-terracotta/10 pt-5">
              <p className="text-sm font-medium text-terracotta mb-1">Social Links (optional)</p>
              <p className="text-xs text-charcoal/50 mb-3">Add any you'd like buyers to find you on — none of these are required.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Instagram</label>
                  <input {...register("instagram")} placeholder="instagram.com/yourcraft" className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium">Facebook</label>
                  <input {...register("facebook")} placeholder="facebook.com/yourcraft" className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium">WhatsApp</label>
                  <input {...register("whatsapp")} placeholder="+91 XXXXX XXXXX" className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium">Website</label>
                  <input {...register("website")} placeholder="yourcraftsite.com" className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        <Recaptcha onChange={setRecaptchaToken} />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating account..." : "Create Account"}
        </Button>

        <p className="text-center text-sm text-charcoal/60">
          Already have an account? <Link to="/login" className="text-terracotta font-medium">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;