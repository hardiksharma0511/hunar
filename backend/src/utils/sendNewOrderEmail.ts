import { transporter } from "../config/mailer";

interface OrderItemSummary {
  name: string;
  quantity: number;
  price: number;
}

// Notifies a seller by email the moment a buyer places an order containing
// their product(s) — so they don't have to keep checking the dashboard.
export const sendNewOrderEmail = async (
  to: string,
  sellerName: string,
  orderId: string,
  items: OrderItemSummary[]
) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("EMAIL_USER/EMAIL_PASS not configured — skipping new-order email.");
    return;
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemLines = items.map((i) => `${i.name} × ${i.quantity} — ₹${(i.price * i.quantity).toLocaleString("en-IN")}`);

  await transporter.sendMail({
    from: `"Hunar" <${process.env.EMAIL_USER}>`,
    to,
    subject: `New order received — #${orderId.slice(-8).toUpperCase()}`,
    text: `Hi ${sellerName}, you've received a new order!\n\n${itemLines.join("\n")}\n\nTotal (your items): ₹${total.toLocaleString("en-IN")}\n\nLog in to your Seller Dashboard to view full details and mark it as shipped.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#A0522D;">You've received a new order, ${sellerName}!</h2>
        <p style="color:#2F2A26;">Order #${orderId.slice(-8).toUpperCase()}</p>
        <ul style="color:#2F2A26; padding-left: 18px;">
          ${items.map((i) => `<li>${i.name} × ${i.quantity} — ₹${(i.price * i.quantity).toLocaleString("en-IN")}</li>`).join("")}
        </ul>
        <p style="font-weight: bold; color:#2F2A26;">Total (your items): ₹${total.toLocaleString("en-IN")}</p>
        <p style="color:#666; font-size: 13px;">Log in to your Hunar Seller Dashboard to view full order details, the buyer's shipping address, and mark it as shipped once it's on its way.</p>
      </div>
    `,
  });
};