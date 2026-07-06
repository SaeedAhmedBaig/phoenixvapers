import { StoreShell } from "../components";
import { CartView, ProductGrid } from "../interactive";
import { Badge, SectionHeader } from "../ui";
import { products } from "../siteData";

export const metadata = {
  title: "Your Basket",
  description: "Review your Phoenix Vapers basket with threshold messaging, rewards, and age-aware notices.",
};

export default function CartPage() {
  const recommended = products
    .filter((product) => ["deals", "essentials"].includes(product.collection))
    .slice(0, 4);

  return (
    <StoreShell>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-6xl bg-gradient-to-br from-ink to-[#101617] p-6 text-white md:p-10">
          <Badge tone="lime">Basket</Badge>
          <h1 className="mt-5 text-4xl font-black leading-none tracking-[-0.06em] md:text-6xl">
            Review your regulated vape basket.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/70">
            Threshold messaging, rewards, age-aware notices, line items, and checkout confidence
            before payment.
          </p>
        </div>
      </section>

      <CartView />

      <section className="mx-auto max-w-7xl px-4 py-10">
        <SectionHeader
          eyebrow="Basket builder"
          title="Useful add-ons, not noisy upsells."
          text="Recommendations stay focused on coils, bundle deals, and repeat essentials."
        />
        <ProductGrid products={recommended} />
      </section>
    </StoreShell>
  );
}
