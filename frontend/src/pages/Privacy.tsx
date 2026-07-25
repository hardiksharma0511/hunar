const Privacy = () => (
  <div className="section-padding container-hunar max-w-3xl">
    <span className="font-script text-2xl text-saffron">Legal</span>
    <h1 className="font-display text-4xl mt-1 mb-8">Privacy Policy</h1>

    <div className="space-y-6 text-charcoal/75 leading-relaxed">
      <p>Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

      <section>
        <h2 className="font-display text-xl text-charcoal mb-2">1. What We Collect</h2>
        <p>When you register, we collect your name, email, and (optionally) phone and address. When you place an order, we collect the shipping address and phone number needed to deliver it. Sellers may additionally provide a craft story, photo, and social media links.</p>
      </section>

      <section>
        <h2 className="font-display text-xl text-charcoal mb-2">2. How We Use It</h2>
        <p>Your information is used to operate your account, process orders, connect buyers with sellers for fulfillment, and send you updates about your orders. We do not sell your personal data to third parties.</p>
      </section>

      <section>
        <h2 className="font-display text-xl text-charcoal mb-2">3. Sharing With Sellers</h2>
        <p>When you place an order, your shipping name, address, and phone number are shared with the seller(s) whose products you purchased, solely so they can ship your order and provide tracking information.</p>
      </section>

      <section>
        <h2 className="font-display text-xl text-charcoal mb-2">4. Images</h2>
        <p>Product photos and profile photos are stored via Cloudinary, a third-party image hosting service, and are publicly viewable as part of your listing or profile.</p>
      </section>

      <section>
        <h2 className="font-display text-xl text-charcoal mb-2">5. Cookies & Local Storage</h2>
        <p>We use browser local storage to keep you logged in between visits. We do not use third-party advertising trackers.</p>
      </section>

      <section>
        <h2 className="font-display text-xl text-charcoal mb-2">6. Your Rights</h2>
        <p>You can update or delete most of your information from your Profile Settings page at any time. To request full account deletion, contact support.hunar@gmail.com.</p>
      </section>

      <section>
        <h2 className="font-display text-xl text-charcoal mb-2">7. Contact</h2>
        <p>Questions about this policy can be sent to support.hunar@gmail.com.</p>
      </section>
    </div>
  </div>
);

export default Privacy;