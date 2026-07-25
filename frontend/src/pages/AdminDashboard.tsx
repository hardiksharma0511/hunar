import { useEffect, useState } from "react";
import { Users, Package, ShoppingCart, ShieldBan, ShieldCheck, Trash2 } from "lucide-react";
import api from "../lib/axios";
import { Spinner } from "../components/ui/Spinner";
import { Badge } from "../components/ui/Badge";

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
  const [tab, setTab] = useState<"users" | "products" | "orders">("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get("/admin/users"),
      api.get("/admin/products"),
      api.get("/admin/orders"),
    ])
      .then(([u, p, o]) => {
        setUsers(u.data.users);
        setProducts(p.data.products);
        setOrders(o.data.orders);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggleBlock = async (id: string) => {
    const { data } = await api.put(`/admin/users/${id}/block`);
    setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, isBlocked: data.user.isBlocked } : u)));
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Remove this product listing? This cannot be undone.")) return;
    await api.delete(`/admin/products/${id}`);
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  if (loading) return <Spinner className="py-32" />;

  return (
    <div className="section-padding container-hunar">
      <div className="mb-8">
        <span className="font-script text-2xl text-saffron">Behind the Scenes</span>
        <h1 className="font-display text-3xl mt-1">Admin Dashboard</h1>
      </div>

      <div className="grid sm:grid-cols-3 gap-5 mb-10">
        <div className="bg-sand/40 rounded-clay p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-terracotta/10 flex items-center justify-center"><Users className="w-5 h-5 text-terracotta" /></div>
          <div><p className="text-2xl font-display">{users.length}</p><p className="text-xs text-charcoal/50">Total Users</p></div>
        </div>
        <div className="bg-sand/40 rounded-clay p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-olive/10 flex items-center justify-center"><Package className="w-5 h-5 text-olive" /></div>
          <div><p className="text-2xl font-display">{products.length}</p><p className="text-xs text-charcoal/50">Total Products</p></div>
        </div>
        <div className="bg-sand/40 rounded-clay p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-gold/15 flex items-center justify-center"><ShoppingCart className="w-5 h-5 text-[#8a6d1f]" /></div>
          <div><p className="text-2xl font-display">{orders.length}</p><p className="text-xs text-charcoal/50">Total Orders</p></div>
        </div>
      </div>

      <div className="flex gap-6 border-b border-terracotta/10 mb-6">
        {(["users", "products", "orders"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium capitalize border-b-2 -mb-px ${tab === t ? "border-terracotta text-terracotta" : "border-transparent text-charcoal/50"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u._id} className="flex items-center justify-between bg-sand/40 rounded-clay p-4 flex-wrap gap-3">
              <div>
                <p className="font-medium">{u.name} {u.isAdmin && <Badge tone="gold">Admin</Badge>}</p>
                <p className="text-xs text-charcoal/50">{u.email} · {u.role} · Joined {new Date(u.createdAt).toLocaleDateString("en-IN")}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={u.isVerified ? "olive" : "saffron"}>{u.isVerified ? "Verified" : "Unverified"}</Badge>
                {u.isBlocked && <Badge tone="terracotta">Blocked</Badge>}
                {!u.isAdmin && (
                  <button
                    onClick={() => handleToggleBlock(u._id)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${u.isBlocked ? "border-olive text-olive hover:bg-olive/10" : "border-red-300 text-red-600 hover:bg-red-50"}`}
                  >
                    {u.isBlocked ? <><ShieldCheck className="w-3.5 h-3.5" /> Unblock</> : <><ShieldBan className="w-3.5 h-3.5" /> Block</>}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "products" && (
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p._id} className="flex items-center justify-between bg-sand/40 rounded-clay p-4 flex-wrap gap-3">
              <div>
                <p className="font-medium">{p.name}</p>
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
      )}

      {tab === "orders" && (
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
      )}
    </div>
  );
};

export default AdminDashboard;