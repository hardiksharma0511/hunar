export type Role = "buyer" | "seller";

export interface SellerProfile {
  city: string;
  craft: string;
  story: string;
  specialization: string;
  yearsOfExperience: number;
  photo: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
    website?: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  address?: string;
  sellerProfile?: SellerProfile;
  isVerified?: boolean;
  isAdmin?: boolean;
}

export interface Review {
  _id?: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  categoryName: string;
  subcategoryName?: string;
  sellerCity?: string;
  status?: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  seller: { _id: string; name: string; isVerified?: boolean; sellerProfile?: Partial<SellerProfile> } | string;
  stock: number;
  materials: string[];
  rating: number;
  numReviews: number;
  reviews: Review[];
  isFeatured: boolean;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  subcategories: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id: string;
  items: CartItem[];
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  seller: string;
}

export interface Order {
  _id: string;
  buyer: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  itemsTotal: number;
  shippingFee: number;
  totalAmount: number;
  status: "placed" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingId?: string;
  courierName?: string;
  createdAt: string;
}

export interface Artisan {
  _id: string;
  name: string;
  avatar?: string;
  sellerProfile?: SellerProfile;
  isVerified?: boolean;
  createdAt: string;
}