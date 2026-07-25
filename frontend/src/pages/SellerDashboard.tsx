import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Package, IndianRupee, ShoppingCart } from "lucide-react";
import api from "../lib/axios";
import { Product, Order } from "../types";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { SellerOrderCard } from "../components/product/SellerOrderCard";

const SellerDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"products" | "orders">("products");

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/products/seller/mine"), api.get("/orders/seller")])
      .then(([p, o]) => {
        setProducts(p.data.products);
        setOrders(o.data.orders);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await api.delete(`/products/${id}`);
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    const { data } = await api.put(`/orders/${orderId}/status`, { status });
    setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
  };

  const handleTrackingSave = async (orderId: string, trackingId: string, courierName: string) => {
    const { data } = await api.put(`/orders/${orderId}/status`, { trackingId, courierName });
    setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
  };

  if (loading) return <Spinner className="py-32" />;

  const totalRevenue = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.price * i.quantity, 0), 0);

  return (
    <div className="section-padding container-hunar">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <span className="font-script text-2xl text-saffron">Artisan Dashboard</span>
          <h1 className="font-display text-3xl mt-1">Manage Your Shop</h1>
        </div>
        <Link to="/seller/products/new"><Button><Plus className="w-4 h-4" /> Add Product</Button></Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-5 mb-10">
        <div className="bg-sand/40 rounded-clay p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-terracotta/10 flex items-center justify-center"><Package className="w-5 h-5 text-terracotta" /></div>
          <div><p className="text-2xl font-display">{products.length}</p><p className="text-xs text-charcoal/50">Products Listed</p></div>
        </div>
        <div className="bg-sand/40 rounded-clay p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-olive/10 flex items-center justify-center"><ShoppingCart className="w-5 h-5 text-olive" /></div>
          <div><p className="text-2xl font-display">{orders.length}</p><p className="text-xs text-charcoal/50">Orders Received</p></div>
        </div>
        <div className="bg-sand/40 rounded-clay p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-gold/15 flex items-center justify-center"><IndianRupee className="w-5 h-5 text-[#8a6d1f]" /></div>
          <div><p className="text-2xl font-display">₹{totalRevenue.toLocaleString("en-IN")}</p><p className="text-xs text-charcoal/50">Total Revenue</p></div>
        </div>
      </div>

      <div className="flex gap-6 border-b border-terracotta/10 mb-6">
        {(["products", "orders"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              if (t === "orders") {
                api
                  .put("/orders/seller/mark-seen")
                  .then(() => window.dispatchEvent(new Event("hunar:orders-seen")))
                  .catch(() => {});
              }
            }}
            className={`pb-3 text-sm font-medium capitalize border-b-2 -mb-px ${tab === t ? "border-terracotta text-terracotta" : "border-transparent text-charcoal/50"}`}
          >
            {t === "products" ? "My Products" : "Orders"}
          </button>
        ))}
      </div>

      {tab === "products" ? (
        products.length === 0 ? (
          <p className="text-charcoal/60">You haven't listed any products yet.</p>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <div key={p._id} className="flex items-center gap-4 bg-sand/40 rounded-clay p-4">
                <img src={p.images[0]} alt={p.name} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-1">{p.name}</p>
                  <p className="text-sm text-terracotta font-semibold">₹{(p.discountPrice || p.price).toLocaleString("en-IN")}</p>
                  <p className="text-xs text-charcoal/50">Stock: {p.stock} · {p.categoryName}</p>
                </div>
                <Link to={`/seller/products/${p._id}/edit`} className="w-9 h-9 rounded-full border border-terracotta/30 flex items-center justify-center hover:bg-terracotta/10">
                  <Pencil className="w-4 h-4 text-terracotta" />
                </Link>
                <button onClick={() => handleDelete(p._id)} className="w-9 h-9 rounded-full border border-red-200 flex items-center justify-center hover:bg-red-50">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )
      ) : orders.length === 0 ? (
        <p className="text-charcoal/60">No orders yet for your products.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <SellerOrderCard
              key={order._id}
              order={order}
              onStatusChange={handleStatusChange}
              onTrackingSave={handleTrackingSave}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;