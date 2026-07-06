import { StoreShell, TrustRail } from "../components";
import { ProductBrowser } from "../interactive";
import { Badge, SectionHeader, StatsGrid } from "../ui";
import { products } from "../siteData";

export const metadata = {
  title: "Shop All Products",
  description:
    "Browse the full Phoenix Vapers catalogue: e-liquids, hardware, coils, and CBD with faceted filtering, search, and sort.",
};

const stats = [
  ["320+", "e-liquid options"],
  ["100+", "hardware range"],
  ["68", "coil & pod essentials"],
  ["£30", "free delivery threshold"],
];

export default function ShopPage() {
  return (
    <StoreShell>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-6xl border border-line bg-white p-6 shadow-2xl shadow-brand/5 md:p-10">
          <Badge tone="soft">Shop</Badge>
          <h1 className="mt-5 max-w-4xl text-balance text-4xl font-black leading-[0.95] tracking-[-0.06em] text-ink md:text-6xl">
            Enterprise product discovery for Phoenix Vapers.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
            A full listing experience with reusable product cards, working facet filters, search,
            sort, trust cues, and real category architecture.
          </p>
          <div className="mt-8">
            <StatsGrid stats={stats} />
          </div>
        </div>
      </section>

      <ProductBrowser products={products} heading="Shop all" />

      <section className="mx-auto max-w-7xl px-4 py-10">
        <SectionHeader
          eyebrow="Trust before checkout"
          title="Concrete trust cues where decisions happen."
          text="Delivery, age verification, payment security, and batch testing stay near catalogue interactions."
        />
        <TrustRail />
      </section>
    </StoreShell>
  );
}
