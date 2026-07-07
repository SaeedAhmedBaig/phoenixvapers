import { StoreShell } from "../components/storefront/store-shell";
import { CheckoutFlow } from "../components/storefront/checkout-flow";
import { Badge } from "../components/ui/badge";
import { getShippingMethods } from "../lib/api";

export const metadata = {
  title: "Checkout | Phoenix Vapers",
  description: "Age-aware Phoenix Vapers checkout with contact, delivery, review, and payment steps.",
};

export default async function CheckoutPage() {
  const shippingMethods = await getShippingMethods().catch(() => []);

  return (
    <StoreShell newsletter={false}>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl md:p-10">
          <Badge>Checkout</Badge>
          <h1 className="mt-5 max-w-4xl text-balance text-4xl font-black leading-none tracking-tight text-foreground sm:text-5xl">
            Low-friction checkout for a regulated category.
          </h1>
          <p className="mt-5 max-w-3xl text-pretty text-base leading-7 text-muted-foreground lg:text-lg">
            A guided flow for contact, delivery, review, and payment — with your order summary,
            delivery, and loyalty points visible throughout.
          </p>
        </div>
      </section>

      <CheckoutFlow shippingMethods={shippingMethods} />
    </StoreShell>
  );
}
