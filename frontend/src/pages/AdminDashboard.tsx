import { useEffect, useState } from "react";
import { Users, Package, ShoppingCart, ShieldBan, ShieldCheck, Trash2, Clock, Check, X, FolderPlus, Pencil } from "lucide-react";
import api from "../lib/axios";
import { Spinner } from "../components/ui/Spinner";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Category } from "../types";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  isBlocked: boolean;
  isAdmin: boolean;
  createdAt: string;
}

interface AdminProduct {
  _id: string;
  name: string;
  price: number;
  categoryName: string;
  status: "pending" | "approved" | "rejected";
  seller: { name: string; email: string } | string;
  createdAt: string;
}

interface AdminOrder {
  _id: string;
  buyer: { name: string; email: string } | string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

const statusTone: Record<string, "terracotta" | "olive" | "gold" | "saffron"> = {
  placed: "saffron",
  processing: "gold",
  shipped: "terracotta",
  delivered: "olive",
  cancelled: "terracotta",
};

const AdminDashboard = () => {
  const [tab, setTab] = useState<"users" | "products" | "pending" | "categories" | "orders">("pending");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [pendingProducts, setPendingProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Sparkles");
  const [catError, setCatError] = useState("");
  const [savingCat, setSavingCat] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get("/admin/users"),
      api.get("/admin/products"),
      api.get("/admin/products/pending"),
      api.get("/categories"),
      api.get("/admin/orders"),
    ])
      .then(([u, p, pend, c, o]) => {
        setUsers(u.data.users);
        setProducts(p.data.products);
        setPendingProducts(pend.data.products);
        setCategories(c.data.categories);
        setOrders(o.data.orders);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggleBlock = async (id: string) => {
    const { data } = await api.put(`/admin/users/${id}/block`);
    setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, isBlocked: data.user.isBlocked } : u)));
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Delete this user and all their product listings? This cannot be undone.")) return;
    await api.delete(`/admin/users/${id}`);
    setUsers((prev) => prev.filter((u) => u._id !== id));
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Remove this product listing? This cannot be undone.")) return;
    await api.delete(`/admin/products/${id}`);
    setProducts((prev) => prev.filter((p) => p._id !== id));
    setPendingProducts((prev) => prev.filter((p) => p._id !== id));
  };

  const handleApprove = async (id: string) => {
    await api.put(`/admin/products/${id}/approve`);
    setPendingProducts((prev) => prev.filter((p) => p._id !== id));
    load();
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Optional: reason for rejecting this listing (shown to the seller)") || "";
    await api.put(`/admin/products/${id}/reject`, { reason });
    setPendingProducts((prev) => prev.filter((p) => p._id !== id));
    load();
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError("");
    if (!newCatName.trim()) return;
    setSavingCat(true);
    try {
      const slug = newCatName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const { data } = await api.post("/admin/categories", {
        name: newCatName.trim(),
        slug,
        icon: newCatIcon.trim() || "Sparkles",
        subcategories: ["Other"],
      });
      setCategories((prev) => [...prev, data.category]);
      setNewCatName("");
      setNewCatIcon("Sparkles");
    } catch (err: any) {
      setCatError(err.response?.data?.message || "Could not create category");
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Could not delete category");
    }
  };

  if (loading) return <Spinner className="py-32" />;

  return (
    <div className="section-padding container-hunar">
      <div className="mb-8">
        <span className="font-script text-2xl text-saffron">Behind the Scenes</span>
        <h1 className="font-display text-3xl mt-1">Admin Dashboard</h1>
      </div>

      <div className="grid sm:grid-cols-4 gap-5 mb-10">
        <div className="bg-sand/40 rounded-clay p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-terracotta/10 flex items-center justify-center"><Users className="w-5 h-5 text-terracotta" /></div>
          <div><p className="text-2xl font-display">{users.length}</p><p className="text-xs text-charcoal/50">Total Users</p></div>
        </div>
        <div className="bg-sand/40 rounded-clay p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-olive/10 flex items-center justify-center"><Package className="w-5 h-5 text-olive" /></div>
          <div><p className="text-2xl font-display">{products.length}</p><p className="text-xs text-charcoal/50">Total Products</p></div>
        </div>
        <div className="bg-sand/40 rounded-clay p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-saffron/15 flex items-center justify-center"><Clock className="w-5 h-5 text-saffron" /></div>
          <div><p className="text-2xl font-display">{pendingProducts.length}</p><p className="text-xs text-charcoal/50">Pending Review</p></div>
        </div>
        <div className="bg-sand/40 rounded-clay p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-gold/15 flex items-center justify-center"><ShoppingCart className="w-5 h-5 text-[#8a6d1f]" /></div>
          <div><p className="text-2xl font-display">{orders.length}</p><p className="text-xs text-charcoal/50">Total Orders</p></div>
        </div>
      </div>

      <div className="flex gap-6 border-b border-terracotta/10 mb-6 overflow-x-auto">
        {(["pending", "users", "products", "categories", "orders"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium capitalize border-b-2 -mb-px whitespace-nowrap ${tab === t ? "border-terracotta text-terracotta" : "border-transparent text-charcoal/50"}`}
          >
            {t === "pending" ? `Pending (${pendingProducts.length})` : t}
          </button>
        ))}
      </div>

      {tab === "pending" && (
        pendingProducts.length === 0 ? (
          <p className="text-charcoal/60 text-center py-16">No products waiting for review. All caught up!</p>
        ) : (
          <div className="space-y-3">
            {pendingProducts.map((p) => (
              <div key={p._id} className="flex items-center justify-between bg-sand/40 rounded-clay p-4 flex-wrap gap-3">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-charcoal/50">
                    ₹{p.price.toLocaleString("en-IN")} · {p.categoryName} · by {typeof p.seller === "object" ? `${p.seller.name} (${p.seller.email})` : "Unknown"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => handleApprove(p._id)}><Check className="w-3.5 h-3.5" /> Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => handleReject(p._id)}><X className="w-3.5 h-3.5" /> Reject</Button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "users" && (
        users.length === 0 ? (
          <p className="text-charcoal/60 text-center py-16">No users yet.</p>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u._id} className="flex items-center justify-between bg-sand/40 rounded-clay p-4 flex-wrap gap-3">
                <div>
                  <p className="font-medium flex items-center gap-2">{u.name} {u.isAdmin && <Badge tone="gold">Admin</Badge>}</p>
                  <p className="text-xs text-charcoal/50">{u.email} · {u.role} · Joined {new Date(u.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={u.isVerified ? "olive" : "saffron"}>{u.isVerified ? "Verified" : "Unverified"}</Badge>
                  {u.isBlocked && <Badge tone="terracotta">Blocked</Badge>}
                  {!u.isAdmin && (
                    <>
                      <button
                        onClick={() => handleToggleBlock(u._id)}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${u.isBlocked ? "border-olive text-olive hover:bg-olive/10" : "border-red-300 text-red-600 hover:bg-red-50"}`}
                      >
                        {u.isBlocked ? <><ShieldCheck className="w-3.5 h-3.5" /> Unblock</> : <><ShieldBan className="w-3.5 h-3.5" /> Block</>}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "products" && (
        products.length === 0 ? (
          <p className="text-charcoal/60 text-center py-16">No products listed yet.</p>
        ) : (
          <div className="space-y-2">
            {products.map((p) => (
              <div key={p._id} className="flex items-center justify-between bg-sand/40 rounded-clay p-4 flex-wrap gap-3">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {p.name}
                    <Badge tone={p.status === "approved" ? "olive" : p.status === "pending" ? "saffron" : "terracotta"}>{p.status}</Badge>
                  </p>
                  <p className="text-xs text-charcoal/50">
                    ₹{p.price.toLocaleString("en-IN")} · {p.categoryName} · by {typeof p.seller === "object" ? p.seller.name : "Unknown"}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteProduct(p._id)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "categories" && (
        <div>
          <form onSubmit={handleCreateCategory} className="bg-sand/40 rounded-clay p-5 mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="flex-1 w-full">
              <label className="text-xs font-medium text-charcoal/60">Category Name</label>
              <input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Leather Goods"
                className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div className="w-full sm:w-40">
              <label className="text-xs font-medium text-charcoal/60">Icon name (lucide)</label>
              <input
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
                placeholder="Sparkles"
                className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <Button type="submit" disabled={savingCat}>
              <FolderPlus className="w-4 h-4" /> {savingCat ? "Adding..." : "Add Category"}
            </Button>
          </form>
          {catError && <p className="text-sm text-red-600 mb-4">{catError}</p>}

          {categories.length === 0 ? (
            <p className="text-charcoal/60 text-center py-16">No categories yet.</p>
          ) : (
            <div className="space-y-2">
              {categories.map((c) => (
                <div key={c._id} className="flex items-center justify-between bg-sand/40 rounded-clay p-4 flex-wrap gap-3">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-charcoal/50">{c.subcategories.length} subcategories · icon: {c.icon}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(c._id)}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "orders" && (
        orders.length === 0 ? (
          <p className="text-charcoal/60 text-center py-16">No orders placed yet.</p>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <div key={o._id} className="flex items-center justify-between bg-sand/40 rounded-clay p-4 flex-wrap gap-3">
                <div>
                  <p className="font-medium">Order #{o._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-charcoal/50">
                    {typeof o.buyer === "object" ? `${o.buyer.name} (${o.buyer.email})` : "Unknown buyer"} · {new Date(o.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-terracotta text-sm">₹{o.totalAmount.toLocaleString("en-IN")}</span>
                  <Badge tone={statusTone[o.status]}>{o.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default AdminDashboard;