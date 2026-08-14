import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db";
import User from "../models/User";
import Category from "../models/Category";
import Product from "../models/Product";
import Cart from "../models/Cart";
import Order from "../models/Order";

// Placeholder image generator using the seed palette, since we don't have
// real product photography or Cloudinary uploads in this demo dataset.
const img = (label: string, bg = "E9DCC7", fg = "A0522D") =>
  `https://placehold.co/700x700/${bg}/${fg}?text=${encodeURIComponent(label)}&font=playfair-display`;

const CATEGORIES = [
  { name: "Paintings", slug: "paintings", icon: "Palette", subcategories: ["Canvas Paintings", "Oil Paintings", "Watercolor", "Acrylic Art", "Portraits", "Sketches", "Pen Art"] },
  { name: "Traditional Art", slug: "traditional-art", icon: "Landmark", subcategories: ["Madhubani", "Warli", "Gond Art", "Miniature Art", "Pattachitra"] },
  { name: "Mandala Art", slug: "mandala-art", icon: "CircleDot", subcategories: ["Mandala Paintings", "Mandala Wall Art", "Dot Mandala", "Mandala Stones"] },
  { name: "Handmade Crafts", slug: "handmade-crafts", icon: "Hand", subcategories: ["Wood Crafts", "Clay Crafts", "Terracotta"] },
  { name: "Pottery", slug: "pottery", icon: "Amphora", subcategories: ["Pottery", "Ceramics"] },
  { name: "Jewelry", slug: "jewelry", icon: "Gem", subcategories: ["Handmade Jewelry"] },
  { name: "Resin Art", slug: "resin-art", icon: "Droplet", subcategories: ["Resin Art"] },
  { name: "Macrame", slug: "macrame", icon: "Waves", subcategories: ["Macrame", "Crochet"] },
  { name: "Embroidery", slug: "embroidery", icon: "Scissors", subcategories: ["Embroidery"] },
  { name: "Candles", slug: "candles", icon: "Flame", subcategories: ["Scented Candles"] },
  { name: "Home Decor", slug: "home-decor", icon: "Home", subcategories: ["Wall Decor", "Dream Catchers"] },
  { name: "Bags & Leather", slug: "bags-leather", icon: "ShoppingBag", subcategories: ["Tote Bags", "Leather Crafts"] },
  { name: "Stationery", slug: "stationery", icon: "BookOpen", subcategories: ["Bookmarks", "Keychains"] },
  { name: "Festival Decor", slug: "festival-decor", icon: "PartyPopper", subcategories: ["Festival Decor", "Wedding Gifts", "Birthday Gifts"] },
  { name: "Eco Friendly", slug: "eco-friendly", icon: "Leaf", subcategories: ["Eco Friendly Products"] },
  { name: "Garden & Kitchen Decor", slug: "garden-kitchen-decor", icon: "Flower2", subcategories: ["Kitchen Decor", "Garden Decor"] },
  { name: "Other Crafts", slug: "other-crafts", icon: "Sparkles", subcategories: ["Other"] },
].map((c) => ({ ...c, subcategories: Array.from(new Set([...c.subcategories, "Other"])) }));

const ARTISANS = [
  { name: "Meera Devi", city: "Madhubani, Bihar", craft: "Madhubani Painting", specialization: "Traditional Madhubani folk art on handmade paper", years: 22, story: "Meera learned Madhubani painting from her grandmother at the age of nine. Her intricate depictions of nature and mythology have been exhibited across three states." },
  { name: "Ramesh Chitara", city: "Bhuj, Gujarat", craft: "Warli Painting", specialization: "Warli tribal wall art and canvas storytelling", years: 18, story: "Ramesh belongs to a family of Warli artists and paints the everyday rhythms of village life using only earth tones and a bamboo brush." },
  { name: "Kavita Kumbhar", city: "Khanapur, Maharashtra", craft: "Pottery & Terracotta", specialization: "Wheel-thrown terracotta pots and diyas", years: 15, story: "Kavita took over her family's pottery wheel after her father's passing and now trains other women in her village in the craft." },
  { name: "Arjun Vishwakarma", city: "Saharanpur, Uttar Pradesh", craft: "Wood Carving", specialization: "Hand-carved rosewood and sheesham decor", years: 25, story: "Arjun's wood carving workshop has been passed down four generations, known for floral jaali patterns inspired by Mughal architecture." },
  { name: "Lakshmi Nair", city: "Kochi, Kerala", craft: "Coir & Macrame", specialization: "Handwoven macrame wall hangings and plant holders", years: 10, story: "Lakshmi turned a pandemic hobby into a full-time craft, using coir and cotton rope sourced from local Kerala cooperatives." },
  { name: "Suresh Prajapati", city: "Jaipur, Rajasthan", craft: "Blue Pottery", specialization: "Hand-painted Jaipur blue pottery ceramics", years: 30, story: "Suresh is a third-generation blue pottery artisan whose workshop supplies decor pieces to boutique hotels across Rajasthan." },
  { name: "Anjali Sharma", city: "Varanasi, Uttar Pradesh", craft: "Embroidery", specialization: "Chikankari and zari thread embroidery", years: 12, story: "Anjali leads a women's embroidery collective in Varanasi, reviving the delicate shadow-work stitches of traditional Chikankari." },
  { name: "Devendra Bhil", city: "Jhabua, Madhya Pradesh", craft: "Gond Art", specialization: "Gond tribal dot-and-line paintings", years: 20, story: "Devendra's Gond paintings translate oral folk tales of the Pardhan Gond community into vivid dotted canvases." },
  { name: "Priya Iyer", city: "Pondicherry", craft: "Candle & Resin Art", specialization: "Hand-poured soy candles and resin coasters", years: 6, story: "Priya blends French-quarter aesthetics with Indian scents like sandalwood and jasmine in her small home studio." },
  { name: "Manoj Das", city: "Raghurajpur, Odisha", craft: "Pattachitra Painting", specialization: "Traditional Pattachitra scroll painting on cloth", years: 28, story: "Manoj lives in the heritage crafts village of Raghurajpur and paints mythological scrolls using natural stone-ground colors." },
];

type SeedProduct = {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  categorySlug: string;
  subcategoryName: string;
  artisanIndex: number;
  materials: string[];
  featured?: boolean;
};

const PRODUCTS: SeedProduct[] = [
  { name: "Radha Krishna Madhubani Canvas", description: "A hand-painted Madhubani artwork depicting Radha and Krishna, rendered in natural pigments on handmade paper mounted on canvas.", price: 3200, discountPrice: 2800, categorySlug: "traditional-art", subcategoryName: "Madhubani", artisanIndex: 0, materials: ["Handmade paper", "Natural pigments", "Canvas mount"], featured: true },
  { name: "Village Life Madhubani Scroll", description: "An elaborate scroll capturing daily village life, fish motifs, and floral borders in the classic double-line Madhubani style.", price: 2600, categorySlug: "traditional-art", subcategoryName: "Madhubani", artisanIndex: 0, materials: ["Handmade paper", "Natural pigments"] },
  { name: "Peacock Madhubani Wall Art", description: "A vibrant peacock design symbolizing grace and prosperity, hand-painted with fine detailing.", price: 1800, categorySlug: "traditional-art", subcategoryName: "Madhubani", artisanIndex: 0, materials: ["Handmade paper", "Natural pigments"] },
  { name: "Warli Tree of Life Wall Hanging", description: "A framed Warli painting portraying the tree of life surrounded by tribal dancers, in traditional white pigment on mud-brown canvas.", price: 2400, categorySlug: "traditional-art", subcategoryName: "Warli", artisanIndex: 1, materials: ["Canvas", "Natural white pigment", "Wooden frame"], featured: true },
  { name: "Warli Harvest Festival Canvas", description: "Depicts a harvest celebration with circular tribal dance formations, a signature Warli composition.", price: 2100, categorySlug: "traditional-art", subcategoryName: "Warli", artisanIndex: 1, materials: ["Canvas", "Natural white pigment"] },
  { name: "Warli Wedding Procession Art", description: "A storytelling piece showing a traditional wedding procession, popular as a housewarming gift.", price: 2900, categorySlug: "traditional-art", subcategoryName: "Warli", artisanIndex: 1, materials: ["Canvas", "Natural white pigment", "Wooden frame"] },
  { name: "Terracotta Diya Set of 11", description: "Hand-thrown terracotta diyas, sun-dried and lightly glazed, perfect for Diwali and everyday use.", price: 450, categorySlug: "pottery", subcategoryName: "Terracotta", artisanIndex: 2, materials: ["Terracotta clay"] },
  { name: "Terracotta Water Pot (Matka)", description: "A traditional water-cooling matka, hand-shaped on the potter's wheel using local river clay.", price: 850, categorySlug: "pottery", subcategoryName: "Pottery", artisanIndex: 2, materials: ["Terracotta clay"] },
  { name: "Rustic Terracotta Planter Trio", description: "Three nested terracotta planters with a matte earthen finish, ideal for succulents and herbs.", price: 1100, discountPrice: 950, categorySlug: "pottery", subcategoryName: "Pottery", artisanIndex: 2, materials: ["Terracotta clay"], featured: true },
  { name: "Hand-carved Rosewood Jaali Panel", description: "An intricately carved decorative wall panel with Mughal-inspired floral jaali work, in solid rosewood.", price: 6500, categorySlug: "handmade-crafts", subcategoryName: "Wood Crafts", artisanIndex: 3, materials: ["Rosewood"], featured: true },
  { name: "Sheesham Wood Elephant Pair", description: "A hand-carved pair of decorative elephants symbolizing good fortune, finished with natural wood oil.", price: 1900, categorySlug: "handmade-crafts", subcategoryName: "Wood Crafts", artisanIndex: 3, materials: ["Sheesham wood"] },
  { name: "Carved Wooden Jewelry Box", description: "A compact jewelry box with hand-carved lotus motifs on the lid and brass hinges.", price: 1450, categorySlug: "handmade-crafts", subcategoryName: "Wood Crafts", artisanIndex: 3, materials: ["Sheesham wood", "Brass"] },
  { name: "Macrame Wall Hanging - Sun Mandala", description: "A large sun-inspired macrame wall hanging handwoven with natural cotton rope and a wooden ring.", price: 1350, categorySlug: "macrame", subcategoryName: "Macrame", artisanIndex: 4, materials: ["Cotton rope", "Wooden ring"], featured: true },
  { name: "Macrame Plant Hanger Set of 2", description: "Two handwoven macrame plant hangers in natural cotton, sized for medium pots.", price: 750, categorySlug: "macrame", subcategoryName: "Macrame", artisanIndex: 4, materials: ["Cotton rope"] },
  { name: "Crochet Boho Cushion Cover", description: "A soft handmade crochet cushion cover in warm terracotta tones with a scalloped edge.", price: 650, categorySlug: "macrame", subcategoryName: "Crochet", artisanIndex: 4, materials: ["Cotton yarn"] },
  { name: "Jaipur Blue Pottery Vase", description: "An iconic Jaipur blue pottery vase, hand-painted with traditional floral motifs using quartz-based ceramic.", price: 1650, categorySlug: "pottery", subcategoryName: "Ceramics", artisanIndex: 5, materials: ["Quartz ceramic"], featured: true },
  { name: "Blue Pottery Dinner Plate Set", description: "A set of four hand-painted blue pottery plates, food-safe and dishwasher friendly.", price: 2200, categorySlug: "pottery", subcategoryName: "Ceramics", artisanIndex: 5, materials: ["Quartz ceramic"] },
  { name: "Blue Pottery Door Knobs (Set of 6)", description: "Decorative hand-painted ceramic door knobs, a signature Jaipur craft detail for any home.", price: 900, categorySlug: "pottery", subcategoryName: "Ceramics", artisanIndex: 5, materials: ["Quartz ceramic", "Brass fitting"] },
  { name: "Chikankari Embroidered Cotton Dupatta", description: "A hand-embroidered Chikankari dupatta on pure cotton, featuring delicate shadow-work floral stitches.", price: 1800, categorySlug: "embroidery", subcategoryName: "Embroidery", artisanIndex: 6, materials: ["Cotton", "Cotton thread"], featured: true },
  { name: "Zari Embroidered Table Runner", description: "A richly embroidered table runner with gold zari thread work on maroon silk-blend fabric.", price: 1200, categorySlug: "embroidery", subcategoryName: "Embroidery", artisanIndex: 6, materials: ["Silk blend", "Zari thread"] },
  { name: "Chikankari Embroidered Cushion Covers (Set of 2)", description: "White-on-white Chikankari embroidered cushion covers, hand-stitched by Varanasi artisans.", price: 950, categorySlug: "embroidery", subcategoryName: "Embroidery", artisanIndex: 6, materials: ["Cotton", "Cotton thread"] },
  { name: "Gond Art Tree of Life Painting", description: "A dotted Gond folk painting depicting the tree of life teeming with birds and animals, in vivid natural colors.", price: 2700, categorySlug: "traditional-art", subcategoryName: "Gond Art", artisanIndex: 7, materials: ["Handmade paper", "Natural pigments"], featured: true },
  { name: "Gond Art Fish Motif Canvas", description: "A striking fish-themed Gond painting symbolizing abundance, hand-dotted in acrylic on canvas.", price: 2300, categorySlug: "traditional-art", subcategoryName: "Gond Art", artisanIndex: 7, materials: ["Canvas", "Acrylic paint"] },
  { name: "Gond Art Peacock Dance Painting", description: "A lively peacock composition in the signature Gond dot-and-line technique.", price: 2500, categorySlug: "traditional-art", subcategoryName: "Gond Art", artisanIndex: 7, materials: ["Canvas", "Acrylic paint"] },
  { name: "Sandalwood Scented Soy Candle", description: "A hand-poured soy wax candle infused with pure sandalwood essential oil, in a reusable ceramic jar.", price: 550, categorySlug: "candles", subcategoryName: "Scented Candles", artisanIndex: 8, materials: ["Soy wax", "Ceramic jar", "Essential oil"], featured: true },
  { name: "Jasmine Resin Coaster Set", description: "A set of four resin coasters embedded with dried jasmine petals, cast and polished by hand.", price: 700, categorySlug: "resin-art", subcategoryName: "Resin Art", artisanIndex: 8, materials: ["Epoxy resin", "Dried flowers"] },
  { name: "Rose & Oud Travel Candle Trio", description: "Three mini soy candles in rose, oud, and sandalwood, hand-poured for travel-friendly gifting.", price: 480, categorySlug: "candles", subcategoryName: "Scented Candles", artisanIndex: 8, materials: ["Soy wax", "Essential oil"] },
  { name: "Resin Ocean Wave Wall Art", description: "A resin art piece capturing an ocean wave in layered blues and golds, ready to hang.", price: 1600, categorySlug: "resin-art", subcategoryName: "Resin Art", artisanIndex: 8, materials: ["Epoxy resin", "Wooden base"] },
  { name: "Pattachitra Jagannath Scroll Painting", description: "A traditional Pattachitra scroll depicting Lord Jagannath, painted with natural stone colors on treated cloth.", price: 3400, categorySlug: "traditional-art", subcategoryName: "Pattachitra", artisanIndex: 9, materials: ["Treated cloth", "Natural stone colors"], featured: true },
  { name: "Pattachitra Tree of Life Panel", description: "An intricately detailed Pattachitra panel showing mythological birds and foliage.", price: 2950, categorySlug: "traditional-art", subcategoryName: "Pattachitra", artisanIndex: 9, materials: ["Treated cloth", "Natural stone colors"] },
  { name: "Pattachitra Ganjapa Playing Cards", description: "A handmade set of traditional circular Ganjapa playing cards, hand-painted with mythological figures.", price: 1200, categorySlug: "traditional-art", subcategoryName: "Pattachitra", artisanIndex: 9, materials: ["Treated cloth", "Natural stone colors"] },
  { name: "Handmade Terracotta Jhumka Earrings", description: "Lightweight terracotta jhumka earrings, hand-painted and finished with cotton tassels.", price: 380, categorySlug: "jewelry", subcategoryName: "Handmade Jewelry", artisanIndex: 2, materials: ["Terracotta clay", "Cotton thread"] },
  { name: "Dokra Metal Necklace", description: "A tribal-inspired necklace made using the ancient Dokra lost-wax metal casting technique.", price: 1450, categorySlug: "jewelry", subcategoryName: "Handmade Jewelry", artisanIndex: 3, materials: ["Bell metal"] },
  { name: "Handwoven Jute Tote Bag", description: "A sturdy, spacious tote bag handwoven from natural jute with leather handles.", price: 620, categorySlug: "bags-leather", subcategoryName: "Tote Bags", artisanIndex: 4, materials: ["Jute", "Leather"] },
  { name: "Hand-tooled Leather Journal Cover", description: "A refillable leather journal with hand-tooled floral tooling, made by local leather artisans.", price: 990, categorySlug: "bags-leather", subcategoryName: "Leather Crafts", artisanIndex: 3, materials: ["Genuine leather"] },
  { name: "Hand-painted Wooden Bookmarks (Set of 5)", description: "Five hand-painted wooden bookmarks featuring miniature Indian motifs, tasseled in cotton thread.", price: 280, categorySlug: "stationery", subcategoryName: "Bookmarks", artisanIndex: 0, materials: ["Wood", "Cotton thread"] },
  { name: "Beaded Keychain Set (Pack of 3)", description: "Handmade beaded keychains in traditional Indian color combinations, strung on waxed thread.", price: 220, categorySlug: "stationery", subcategoryName: "Keychains", artisanIndex: 4, materials: ["Glass beads", "Waxed thread"] },
  { name: "Marigold Torans for Festivals", description: "A hand-strung marigold-inspired fabric toran for door decoration, reusable across festivals.", price: 340, categorySlug: "festival-decor", subcategoryName: "Festival Decor", artisanIndex: 8, materials: ["Cotton fabric", "Fabric flowers"], featured: true },
  { name: "Handmade Seed Paper Wedding Cards (Set of 20)", description: "Eco-friendly wedding invitation cards embedded with wildflower seeds, hand-pressed from recycled paper.", price: 1500, categorySlug: "eco-friendly", subcategoryName: "Eco Friendly Products", artisanIndex: 6, materials: ["Recycled paper", "Wildflower seeds"] },
  { name: "Coconut Shell Kitchen Bowl Set", description: "A set of three polished coconut shell bowls, handcrafted and food-safe, ideal for a rustic kitchen.", price: 480, categorySlug: "garden-kitchen-decor", subcategoryName: "Kitchen Decor", artisanIndex: 2, materials: ["Coconut shell"] },
  { name: "Hand-painted Dot Mandala Canvas", description: "A meditative dot-mandala painting hand-worked in concentric rings of gold and terracotta acrylic on canvas.", price: 2100, categorySlug: "mandala-art", subcategoryName: "Mandala Paintings", artisanIndex: 0, materials: ["Canvas", "Acrylic paint"], featured: true },
  { name: "Mandala Wooden Wall Plate", description: "A hand-carved wooden plate with an intricate mandala pattern, finished with a warm walnut stain.", price: 1750, categorySlug: "mandala-art", subcategoryName: "Mandala Wall Art", artisanIndex: 3, materials: ["Wood"] },
  { name: "Fine-line Pen Art Portrait Print", description: "A hand-drawn fine-liner pen artwork capturing intricate linework, printed on archival paper for framing.", price: 950, categorySlug: "paintings", subcategoryName: "Pen Art", artisanIndex: 7, materials: ["Archival paper", "Ink"] },
  { name: "Custom Hand-Lettered Name Plate", description: "A one-of-a-kind hand-lettered wooden name plate, personalized and painted to order for your doorway.", price: 850, categorySlug: "other-crafts", subcategoryName: "Other", artisanIndex: 3, materials: ["Wood", "Acrylic paint"] },
];

const seed = async () => {
  await connectDB();
  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Cart.deleteMany({}),
    Order.deleteMany({}),
  ]);

  console.log("Seeding categories...");
  const categoryDocs = await Category.insertMany(
    CATEGORIES.map((c) => ({
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      description: `Explore handmade ${c.name.toLowerCase()} crafted by Indian artisans.`,
      subcategories: c.subcategories,
    }))
  );
  const categoryBySlug = new Map(categoryDocs.map((c) => [c.slug, c]));

  console.log("Seeding artisans (sellers)...");
  const artisanDocs = await User.insertMany(
    ARTISANS.map((a, i) => ({
      name: a.name,
      email: `${a.name.toLowerCase().replace(/[^a-z]+/g, ".")}@hunar.demo`,
      password: "password123", // hashed automatically by the pre-save hook
      role: "seller",
      isVerified: true,
      avatar: img(a.name, "D97A2B", "F8F3EA"),
      phone: `9${(800000000 + i * 111111).toString().slice(0, 9)}`,
      address: a.city,
      sellerProfile: {
        city: a.city,
        craft: a.craft,
        story: a.story,
        specialization: a.specialization,
        yearsOfExperience: a.years,
        photo: img(a.name, "D97A2B", "F8F3EA"),
      },
    }))
  );

  console.log("Seeding a demo buyer...");
  await User.create({
    name: "Ananya Gupta",
    email: "buyer@hunar.demo",
    password: "password123",
    role: "buyer",
    isVerified: true,
    address: "Connaught Place, New Delhi",
  });

  console.log("Seeding products...");
  const productDocs = PRODUCTS.map((p) => {
    const category = categoryBySlug.get(p.categorySlug)!;
    const artisan = artisanDocs[p.artisanIndex];
    return {
      name: p.name,
      description: p.description,
      price: p.price,
      discountPrice: p.discountPrice,
      images: [
        img(p.name, "E9DCC7", "A0522D"),
        img(`${p.name} - detail`, "F8F3EA", "C8A951"),
      ],
      category: category._id,
      categoryName: category.name,
      subcategoryName: p.subcategoryName,
      sellerCity: artisan.sellerProfile?.city || "",
      seller: artisan._id,
      status: "approved", // demo catalog is pre-vetted, no need to sit in the moderation queue
      stock: Math.floor(Math.random() * 15) + 3,
      materials: p.materials,
      isFeatured: !!p.featured,
      rating: Math.round((3.8 + Math.random() * 1.2) * 10) / 10,
      numReviews: Math.floor(Math.random() * 40) + 2,
    };
  });

  await Product.insertMany(productDocs);

  console.log(`Seed complete: ${categoryDocs.length} categories, ${artisanDocs.length} artisans, ${productDocs.length} products.`);
  console.log("Demo logins -> buyer@hunar.demo / password123, or any artisan email above / password123");
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});