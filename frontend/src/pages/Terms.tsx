const Terms = () => (
  <div className="section-padding container-hunar max-w-3xl">
    <span className="font-script text-2xl text-saffron">Legal</span>
    <h1 className="font-display text-4xl mt-1 mb-8">Terms & Conditions</h1>

    <div className="space-y-6 text-charcoal/75 leading-relaxed">
      <p>Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

      <section>
        <h2 className="font-display text-xl text-charcoal mb-2">1. About Hunar</h2>
        <p>Hunar is a marketplace connecting independent Indian artisans directly with buyers. We provide the platform; each product is made, listed, priced, and fulfilled by the individual artisan/seller, not by Hunar itself.</p>
      </section>

      <section>
        <h2 className="font-display text-xl text-charcoal mb-2">2. Accounts</h2>
        <p>You must provide accurate information when registering and verify your email address before placing orders or listing products. You are responsible for keeping your account credentials secure.</p>
      </section>

      <section>
        <h2 className="font-display text-xl text-charcoal mb-2">3. Orders & Payment</h2>
        <p>Orders are currently fulfilled on a Cash on Delivery basis. Placing an order is a commitment to accept and pay for it upon delivery. Repeated refusal of COD orders may result in restrictions on your account.</p>
      </section>

      <section>
        <h2 className="font-display text-xl text-charcoal mb-2">4. Cancellations</h2>
        <p>Buyers may cancel an order any time before it is marked "Shipped." Once shipped, cancellation is no longer available through the site; please contact the seller or our support team.</p>
      </section>

      <section>
        <h2 className="font-display text-xl text-charcoal mb-2">5. Sellers</h2>
        <p>Sellers are independent artisans responsible for the accuracy of their listings, the quality of their products, and timely fulfillment. Hunar reserves the right to remove listings or suspend accounts that violate these terms or receive credible complaints.</p>
      </section>

      <section>
        <h2 className="font-display text-xl text-charcoal mb-2">6. Prohibited Conduct</h2>
        <p>Fraudulent orders, fake reviews, harassment of artisans or buyers, and attempts to circumvent the platform's fees or policies are prohibited and may result in account suspension.</p>
      </section>

      <section>
        <h2 className="font-display text-xl text-charcoal mb-2">7. Contact</h2>
        <p>Questions about these terms can be sent to support.hunar@gmail.com.</p>
      </section>
    </div>
  </div>
);

export default Terms;