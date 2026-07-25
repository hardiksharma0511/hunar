import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, Package, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/axios";
import { Order } from "../types";
import { Button } from "../components/ui/Button";
import { AvatarUploader } from "../components/ui/AvatarUploader";

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [photo, setPhoto] = useState(user?.avatar || user?.sellerProfile?.photo || "");
  const [instagram, setInstagram] = useState(user?.sellerProfile?.socialLinks?.instagram || "");
  const [facebook, setFacebook] = useState(user?.sellerProfile?.socialLinks?.facebook || "");
  const [whatsapp, setWhatsapp] = useState(user?.sellerProfile?.socialLinks?.whatsapp || "");
  const [website, setWebsite] = useState(user?.sellerProfile?.socialLinks?.website || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    api.get("/orders/mine").then((res) => setOrders(res.data.orders));
  }, []);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    // Profile photo applies to every user, buyer or seller.
    const payload: any = { name, phone, address, avatar: photo };
    if (user.role === "seller") {
      payload.sellerProfile = {
        ...user.sellerProfile,
        photo,
        socialLinks: { instagram, facebook, whatsapp, website },
      };
    }
    const { data } = await api.put("/users/profile", payload);
    updateUser({ ...user, ...data.user });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="section-padding container-hunar">
      <div className="flex items-center justify-between mb-10">
        <div>
          <span className="font-script text-2xl text-saffron">My Account</span>
          <h1 className="font-display text-3xl mt-1">Hi, {user.name.split(" ")[0]}</h1>
        </div>
        <Button variant="outline" onClick={logout}>
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>

      <div className="grid lg:grid-cols-[320px,1fr] gap-10">
        <form onSubmit={handleSave} className="bg-sand/40 paper-texture rounded-clay p-6 space-y-4 h-fit">
          <h2 className="font-display text-xl flex items-center gap-2"><Settings className="w-5 h-5" /> Profile Details</h2>

          <div>
            <label className="text-sm font-medium mb-2 block">Your Photo</label>
            <AvatarUploader value={photo} onChange={setPhoto} fallbackLabel="photo" />
          </div>

          <div>
            <label className="text-sm font-medium">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input value={user.email} disabled className="w-full mt-1 rounded-lg border border-terracotta/10 bg-ivory/60 px-4 py-2.5 text-charcoal/50" />
          </div>
          <div>
            <label className="text-sm font-medium">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium">Address</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none" />
          </div>

          {user.role === "seller" && (
            <div className="border-t border-terracotta/10 pt-4 space-y-3">
              <p className="text-sm font-medium text-terracotta">Social Links (optional)</p>
              <div>
                <label className="text-xs font-medium">Instagram</label>
                <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="instagram.com/yourcraft" className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium">Facebook</label>
                <input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="facebook.com/yourcraft" className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium">WhatsApp</label>
                <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+91 XXXXX XXXXX" className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium">Website</label>
                <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="yourcraftsite.com" className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-3 py-2 text-sm focus:outline-none" />
              </div>
            </div>
          )}

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </Button>
          {user.role === "seller" && (
            <Link to="/seller/dashboard" className="block text-center text-sm text-terracotta font-medium border-b border-terracotta/40 w-fit mx-auto pt-2">
              Go to Seller Dashboard
            </Link>
          )}
        </form>

        <div>
          <h2 className="font-display text-xl mb-4 flex items-center gap-2"><Package className="w-5 h-5" /> Order History</h2>
          {orders === null ? (
            <p className="text-charcoal/50 text-sm">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-charcoal/50 text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link key={order._id} to={`/orders/${order._id}`} className="flex items-center justify-between bg-sand/40 rounded-clay p-4 hover:bg-sand/60">
                  <div>
                    <p className="font-medium text-sm">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-charcoal/50">{order.items.length} item(s)</p>
                  </div>
                  <p className="font-semibold text-terracotta text-sm">₹{order.totalAmount.toLocaleString("en-IN")}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;