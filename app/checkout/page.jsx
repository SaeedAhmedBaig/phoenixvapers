import { CreditCard, LockKeyhole, UserCheck } from "lucide-react";
import Link from "next/link";
import { Badge, StoreShell } from "../components";

export const metadata = {
  title: "Checkout | Phoenix Vapers",
  description: "Age-aware Phoenix Vapers checkout frontend.",
};

export default function CheckoutPage() {
  return (
    <StoreShell>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-[3rem] border border-[#2C3132]/10 bg-white p-6 shadow-2xl shadow-emerald-950/10 md:p-10">
          <Badge tone="green">Checkout</Badge>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-none tracking-[-0.075em] text-[#2C3132] md:text-7xl">
            Low-friction checkout for a regulated product category.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
            This frontend is prepared for guest checkout, age verification API,
            payment iframe fields, tracked delivery selection, and loyalty
            redemption.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_390px]">
        <form className="grid gap-5">
          <CheckoutStep number="01" title="Contact And Account">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Email address" placeholder="you@example.com" type="email" />
              <Field label="Phone number" placeholder="01733 000000" type="tel" />
            </div>
          </CheckoutStep>

          <CheckoutStep number="02" title="Delivery Address">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name" placeholder="Your name" />
              <Field label="Postcode" placeholder="PE1 5UH" />
              <Field label="Address line 1" placeholder="Street address" wide />
              <Field label="Town / City" placeholder="Peterborough" />
              <Field label="County" placeholder="Cambridgeshire" />
            </div>
          </CheckoutStep>

          <CheckoutStep number="03" title="Age Verification">
            <div className="rounded-3xl bg-[#ecf5df] p-5">
              <label className="flex items-start gap-3 text-sm font-bold leading-7 text-[#2C3132]">
                <input className="mt-1 h-5 w-5 accent-brand" type="checkbox" />
                <span>
                  I confirm I am 18 or over and understand nicotine is addictive.
                  Production checkout should connect to AgeChecked, 1account, or
                  AgeVerifyUK before restricted goods are sold.
                </span>
              </label>
            </div>
          </CheckoutStep>

          <CheckoutStep number="04" title="Payment">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Card number" placeholder="Secure iframe field" />
              <Field label="Expiry" placeholder="MM / YY" />
            </div>
            <p className="text-sm leading-7 text-muted">
              Payment fields are UI placeholders for PCI-scoped hosted fields from
              a supported high-risk payment provider.
            </p>
          </CheckoutStep>

          <button className="min-h-14 rounded-full bg-brand px-6 text-base font-black text-white shadow-lg shadow-emerald-900/15" type="submit">
            Place Secure Order
          </button>
        </form>

        <aside className="rounded-[2rem] border border-[#2C3132]/10 bg-[#2C3132] p-6 text-white shadow-2xl shadow-slate-950/20 lg:sticky lg:top-36">
          <h2 className="text-3xl font-black tracking-[-0.06em]">Checkout Confidence</h2>
          <div className="mt-6 grid gap-4">
            {[
              ["Age verification", "Required before sale", UserCheck],
              ["Secure payment", "Hosted fields ready", LockKeyhole],
              ["Card processing", "High-risk gateway ready", CreditCard],
            ].map(([title, text, Icon]) => (
              <article key={title} className="flex gap-3 rounded-3xl bg-white/10 p-4">
                <Icon className="mt-1 h-5 w-5 text-lime" />
                <div>
                  <strong className="block text-sm font-black">{title}</strong>
                  <span className="text-sm text-white/65">{text}</span>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 rounded-3xl bg-lime p-4 text-sm font-black leading-7 text-[#2C3132]">
            Order total, delivery, loyalty redemption, and age-verification status
            should remain visible until the payment action.
          </div>
          <Link className="mt-6 inline-flex text-sm font-black text-lime" href="/cart">
            Return to cart
          </Link>
        </aside>
      </section>
    </StoreShell>
  );
}

function CheckoutStep({ number, title, children }) {
  return (
    <section className="rounded-[2rem] border border-[#2C3132]/10 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-lime text-sm font-black text-[#2C3132]">
          {number}
        </span>
        <h2 className="text-2xl font-black tracking-[-0.05em] text-[#2C3132]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, placeholder, type = "text", wide = false }) {
  return (
    <label className={wide ? "grid gap-2 text-sm font-black text-[#2C3132] md:col-span-2" : "grid gap-2 text-sm font-black text-[#2C3132]"}>
      {label}
      <input
        className="min-h-12 rounded-full border border-[#2C3132]/10 px-5 outline-none ring-brand/20 transition focus:ring-4"
        placeholder={placeholder}
        type={type}
      />
    </label>
  );
}
