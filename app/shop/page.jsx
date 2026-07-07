import { StoreShell } from "../components/storefront/store-shell";
import { SectionHeader } from "../components/storefront/section-header";
import { TrustRail } from "../components/storefront/trust-badges";
import { ProductBrowser } from "../components/storefront/product-browser";
import { Badge } from "../components/ui/badge";
import { getProducts } from "../lib/api";

export const metadata = {
  title: "Shop All Products | Phoenix Vapers",
  description:
    "Browse the full Phoenix Vapers catalogue: e-liquids, hardware, coils, and CBD with faceted filtering, search, and sort.",
};

export default async function ShopPage() {
  const initialResult = await getProducts({ limit: 24 }).catch(() => null);

  return (
    <StoreShell>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl md:p-10">
          <Badge>Shop</Badge>
          <h1 className="mt-5 max-w-4xl text-balance text-4xl font-black leading-[0.95] tracking-tight text-foreground sm:text-5xl">
            Full product discovery for Phoenix Vapers.
          </h1>
          <p className="mt-5 max-w-3xl text-pretty text-base leading-7 text-muted-foreground lg:text-lg">
            A complete listing experience with working facet filters, search, sort, and trust cues
            next to every decision.
          </p>
        </div>
      </section>

      <ProductBrowser heading="Shop all" initialResult={initialResult} />

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
