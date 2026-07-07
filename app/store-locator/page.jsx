import { StoreShell } from "../components/storefront/store-shell";
import { SectionHeader } from "../components/storefront/section-header";
import { Badge } from "../components/ui/badge";
import { getStores } from "../lib/api";
import { StoreLocatorClient } from "./store-locator-client";

export const metadata = {
  title: "Find a Store | Phoenix Vapers",
  description: "Find Phoenix Vapers locations near you. Visit our UK stores for vape products, advice, and age-verified checkout.",
};

export default async function StoreLocatorPage() {
  const stores = await getStores().catch(() => []);

  return (
    <StoreShell>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl md:p-10">
          <Badge>Find Us</Badge>
          <h1 className="mt-5 max-w-4xl text-balance text-4xl font-black leading-[0.95] tracking-tight text-foreground sm:text-5xl">
            Find your nearest Phoenix Vapers store.
          </h1>
          <p className="mt-5 max-w-3xl text-pretty text-base leading-7 text-muted-foreground lg:text-lg">
            Visit us in person for expert advice, product testing, and immediate age-verified checkout. Open hours vary by location.
          </p>
        </div>
      </section>

      <StoreLocatorClient initialStores={stores} />

      <section className="mx-auto max-w-7xl px-4 py-10">
        <SectionHeader
          eyebrow="In-Store Experience"
          title="More than just a checkout."
          text="Our trained staff can answer your questions about devices, nicotine formats, flavour preferences, and regulations. All stores are fully age-verified and compliant with UK vaping law."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-black text-foreground">Expert Staff</h3>
            <p className="mt-3 text-sm text-muted-foreground">Trained advisors to match you with the right products.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-black text-foreground">Product Testing</h3>
            <p className="mt-3 text-sm text-muted-foreground">Test devices and flavours before you buy.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-black text-foreground">Fast Checkout</h3>
            <p className="mt-3 text-sm text-muted-foreground">Age verification and payment in under 5 minutes.</p>
          </div>
        </div>
      </section>
    </StoreShell>
  );
}
