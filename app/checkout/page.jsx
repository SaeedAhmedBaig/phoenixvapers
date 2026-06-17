import Link from "next/link";
import { StoreShell } from "../components";

export const metadata = {
  title: "Checkout | Phoenix Vapers",
  description: "Phoenix Vapers checkout frontend.",
};

export default function CheckoutPage() {
  return (
    <StoreShell>
      <section className="pageHero">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1>Secure, age-aware checkout flow.</h1>
          <p className="heroLead">
            This frontend checkout is ready for payment, account, age verification,
            delivery, and loyalty integrations.
          </p>
        </div>
      </section>

      <section className="checkoutLayout">
        <form className="checkoutForm">
          <fieldset>
            <legend>Contact</legend>
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" placeholder="you@example.com" />
            <label htmlFor="phone">Phone</label>
            <input id="phone" type="tel" placeholder="01733 000000" />
          </fieldset>

          <fieldset>
            <legend>Delivery Address</legend>
            <label htmlFor="name">Full name</label>
            <input id="name" type="text" placeholder="Your name" />
            <label htmlFor="address">Address</label>
            <input id="address" type="text" placeholder="Street address" />
            <label htmlFor="postcode">Postcode</label>
            <input id="postcode" type="text" placeholder="PE1 5UH" />
          </fieldset>

          <fieldset>
            <legend>Age Confirmation</legend>
            <label className="checkRow" htmlFor="age">
              <input id="age" type="checkbox" />
              <span>I confirm I am 18 or over and understand nicotine is addictive.</span>
            </label>
          </fieldset>

          <button type="submit">Place Secure Order</button>
        </form>

        <aside className="orderSummary">
          <h2>Checkout Summary</h2>
          <div>
            <span>Products</span>
            <strong>4 items</strong>
          </div>
          <div>
            <span>Delivery</span>
            <strong>Royal Mail Tracked 24</strong>
          </div>
          <div>
            <span>Payment</span>
            <strong>Card / wallet ready</strong>
          </div>
          <p>
            Backend integration can connect this UI to Stripe, WooCommerce,
            Shopify, or a custom order API.
          </p>
          <Link className="secondaryButton" href="/cart">
            Return To Cart
          </Link>
        </aside>
      </section>
    </StoreShell>
  );
}
