import Link from "next/link";
import { ProductGrid, SectionHeader, StoreShell } from "../components";
import { products } from "../siteData";

const cartItems = [
  { product: products[0], quantity: 2 },
  { product: products[5], quantity: 1 },
  { product: products[8], quantity: 1 },
];

const subtotal = cartItems.reduce(
  (total, item) => total + item.product.price * item.quantity,
  0,
);

export const metadata = {
  title: "Cart | Phoenix Vapers",
  description: "Review your Phoenix Vapers basket before checkout.",
};

export default function CartPage() {
  const recommended = products
    .filter((product) => ["deals", "essentials"].includes(product.collection))
    .slice(0, 4);

  return (
    <StoreShell>
      <section className="pageHero">
        <div>
          <p className="eyebrow">Basket</p>
          <h1>Your Phoenix Vapers cart.</h1>
          <p className="heroLead">
            A polished frontend basket with line items, quantity controls,
            delivery threshold, loyalty reminder, and checkout summary.
          </p>
        </div>
      </section>

      <section className="cartLayout">
        <div className="cartItems">
          {cartItems.map((item) => (
            <article key={item.product.slug}>
              <div className="cartThumb">{item.product.brand.slice(0, 2).toUpperCase()}</div>
              <div>
                <h3>{item.product.name}</h3>
                <p>{item.product.format} · {item.product.strength}</p>
                <div className="quantityPill">Qty {item.quantity}</div>
              </div>
              <strong>£{(item.product.price * item.quantity).toFixed(2)}</strong>
            </article>
          ))}
        </div>

        <aside className="orderSummary">
          <h2>Order Summary</h2>
          <div>
            <span>Subtotal</span>
            <strong>£{subtotal.toFixed(2)}</strong>
          </div>
          <div>
            <span>Tracked 24 Delivery</span>
            <strong>{subtotal >= 30 ? "Free" : "£3.99"}</strong>
          </div>
          <div>
            <span>Loyalty points earned</span>
            <strong>{Math.floor(subtotal)} pts</strong>
          </div>
          <p>
            {subtotal >= 30
              ? "You unlocked free Royal Mail Tracked 24 delivery."
              : `Add £${(30 - subtotal).toFixed(2)} more to unlock free Tracked 24.`}
          </p>
          <Link className="primaryButton" href="/checkout">
            Continue To Checkout
          </Link>
          <Link className="secondaryButton" href="/shop">
            Keep Shopping
          </Link>
        </aside>
      </section>

      <section className="storeSection">
        <SectionHeader
          eyebrow="Complete Your Basket"
          title="Popular add-ons and repeat essentials."
          text="Cart upsells keep shoppers close to coils, bundles, and refill products."
        />
        <ProductGrid products={recommended} />
      </section>
    </StoreShell>
  );
}
