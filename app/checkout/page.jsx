import { StoreShell } from "../components";
import { CheckoutFlow } from "../interactive";
import { Badge } from "../ui";

export const metadata = {
  title: "Checkout",
  description: "Age-aware Phoenix Vapers checkout with contact, delivery, verification, and payment steps.",
};

export default function CheckoutPage() {
  return (
    <StoreShell>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-6xl border border-line bg-white p-6 shadow-2xl shadow-brand/5 md:p-10">
          <Badge tone="soft">Checkout</Badge>
          <h1 className="mt-5 max-w-4xl text-balance text-4xl font-black leading-none tracking-[-0.06em] text-ink md:text-6xl">
            Low-friction checkout for a regulated category.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
            A guided flow for contact, delivery, age verification, and payment — with your order
            summary, delivery, and loyalty points visible throughout.
          </p>
        </div>
      </section>

      <CheckoutFlow />
    </StoreShell>
  );
}
