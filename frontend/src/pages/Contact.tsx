import { useState } from "react";
import { Mail, Phone, MapPin, CheckCircle2 } from "lucide-react";
import api from "../lib/axios";
import { Button } from "../components/ui/Button";
import { Recaptcha } from "../components/ui/Recaptcha";

const SUPPORT_EMAIL = "support.hunar@gmail.com";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await api.post("/contact", { name, email, message, recaptchaToken });
      // Clear the form so the visitor can send another message right away
      setName("");
      setEmail("");
      setMessage("");
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not send your message. Please try again in a moment.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="section-padding container-hunar">
      <div className="text-center mb-12">
        <span className="font-script text-2xl text-saffron">Get in Touch</span>
        <h1 className="font-display text-4xl mt-1">Contact Us</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <MapPin className="w-5 h-5 text-terracotta mt-1" />
            <div><p className="font-medium">Address</p><p className="text-sm text-charcoal/60">Ranikhet, Uttarakhand, India</p></div>
          </div>
          <div className="flex items-start gap-4">
            <Mail className="w-5 h-5 text-terracotta mt-1" />
            <div>
              <p className="font-medium">Email</p>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm text-charcoal/60 hover:text-terracotta">{SUPPORT_EMAIL}</a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Phone className="w-5 h-5 text-terracotta mt-1" />
            <div><p className="font-medium">Phone</p><p className="text-sm text-charcoal/60">+91 63998 67305</p></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-sand/40 paper-texture rounded-clay p-6 space-y-4">
          {sent && (
            <p className="flex items-center gap-2 text-sm text-olive bg-olive/10 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> Your message has been sent — we'll get back to you soon.
            </p>
          )}
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div>
            <label className="text-sm font-medium">Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium">Message</label>
            <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full mt-1 rounded-lg border border-terracotta/20 bg-ivory px-4 py-2.5 focus:outline-none" />
          </div>
          <Recaptcha onChange={setRecaptchaToken} />

          <Button type="submit" disabled={sending} className="w-full">
            {sending ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Contact;