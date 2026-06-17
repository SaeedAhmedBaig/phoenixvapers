import { Gift, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { Badge, ButtonLink, ProductGrid, SectionHeader, StoreShell } from "../components";
import { products } from "../siteData";

const cartItems = [
  { product: products[0], quantity: 2 },
  { product: products[5], quantity: 1 },
  { product: products[8], quantity: 1 },
];

const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
const delivery = subtotal >= 30 ? 0 : 3.99;

export const metadata = {
  title: "Cart | Phoenix Vapers",
  description: "Phoenix Vapers ecommerce cart frontend.",
};

export default function CartPage() {
  const recommended = products.filter((product) => ["deals", "essentials"].includes(product.collection)).slice(0, 4);

  return (
    <StoreShell>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-[3rem] bg-[#2C3132] p-6 text-white md:p-10">
          <Badge tone="lime">Basket</Badge>
          <h1 className="mt-5 text-5xl font-black leading-none tracking-[-0.075em] md:text-7xl">
            Review your regulated vape basket.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/70">
            Cart UX includes threshold messaging, rewards, age-aware notices, line
            items, and checkout confidence before payment.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-4">
          {cartItems.map((item) => (
            <article key={item.product.slug} className="grid gap-4 rounded-[2rem] border border-[#2C3132]/10 bg-white p-5 shadow-sm md:grid-cols-[6rem_1fr_auto] md:items-center">
              <div className="grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-brand to-lime text-2xl font-black text-white">
                {item.product.brand.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <Badge tone="soft">{item.product.badge}</Badge>
                <h2 className="mt-3 text-2xl font-black tracking-[-0.05em] text-[#2C3132]">
                  {item.product.name}
                </h2>
                <p className="mt-1 text-sm font-bold text-muted">
                  {item.product.format} · {item.product.strength}
                </p>
                <div className="mt-3 inline-flex rounded-full bg-[#ecf5df] px-3 py-1 text-xs font-black text-[#2C3132]">
                  Quantity {item.quantity}
                </div>
              </div>
              <strong className="text-2xl font-black tracking-[-0.05em] text-[#2C3132]">
                £{(item.product.price * item.quantity).toFixed(2)}
              </strong>
            </article>
          ))}
        </div>

        <aside className="rounded-[2rem] border border-[#2C3132]/10 bg-white p-6 shadow-2xl shadow-emerald-950/10 lg:sticky lg:top-36">
          <h2 className="text-3xl font-black tracking-[-0.06em] text-[#2C3132]">Order Summary</h2>
          <div className="mt-6 grid gap-4">
            {[
              ["Subtotal", `£${subtotal.toFixed(2)}`],
              ["Tracked 24 delivery", delivery === 0 ? "Free" : `£${delivery.toFixed(2)}`],
              ["Loyalty points", `${Math.floor(subtotal)} pts`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-[#2C3132]/10 pb-3">
                <span className="font-bold text-muted">{label}</span>
                <strong className="text-[#2C3132]">{value}</strong>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-3xl bg-[#ecf5df] p-4 text-sm font-bold leading-7 text-[#2C3132]">
            {subtotal >= 30
              ? "Free Royal Mail Tracked 24 unlocked."
              : `Add £${(30 - subtotal).toFixed(2)} more to unlock free Tracked 24.`}
          </div>

          <div className="mt-5 grid gap-3 text-sm font-bold text-muted">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand" /> 18+ age verification required</span>
            <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-brand" /> Royal Mail tracked services</span>
            <span className="flex items-center gap-2"><Gift className="h-4 w-4 text-brand" /> Points earned on eligible spend</span>
          </div>

          <div className="mt-6 grid gap-3">
            <ButtonLink href="/checkout">Continue To Checkout</ButtonLink>
            <Link className="text-center text-sm font-black text-brand" href="/shop">
              Keep Shopping
            </Link>
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <SectionHeader
          eyebrow="Basket Builder"
          title="Useful add-ons, not noisy upsells."
          text="Cart recommendations stay focused on coils, bundle deals, and repeat essentials."
        />
        <ProductGrid products={recommended} />
      </section>
    </StoreShell>
  );
}
