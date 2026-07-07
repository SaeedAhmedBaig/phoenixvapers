import { StoreShell } from "../components/storefront/store-shell";
import { SectionHeader } from "../components/storefront/section-header";
import { ProductGrid } from "../components/storefront/product-grid";
import { CartView } from "../components/storefront/cart-view";
import { Badge } from "../components/ui/badge";
import { getProducts } from "../lib/api";

export const metadata = {
  title: "Your Basket | Phoenix Vapers",
  description: "Review your Phoenix Vapers basket with threshold messaging, rewards, and age-aware notices.",
};

export default async function CartPage() {
  const recommended = await getProducts({ collection: "deals", limit: 4 }).catch(() => ({ items: [] }));

  return (
    <StoreShell newsletter={false}>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-2xl bg-surface-dark p-6 text-surface-dark-foreground md:p-10">
          <Badge className="bg-primary text-primary-foreground">Basket</Badge>
          <h1 className="mt-5 text-4xl font-black leading-none tracking-tight sm:text-5xl">
            Review your regulated vape basket.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-surface-dark-muted lg:text-lg">
            Threshold messaging, rewards, age-aware notices, line items, and checkout confidence
            before payment.
          </p>
        </div>
      </section>

      <CartView />

      {recommended.items?.length ? (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <SectionHeader
            eyebrow="Basket builder"
            title="Useful add-ons, not noisy upsells."
            text="Recommendations stay focused on bundle deals and repeat essentials."
          />
          <ProductGrid products={recommended.items} />
        </section>
      ) : null}
    </StoreShell>
  );
}
