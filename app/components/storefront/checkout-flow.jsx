"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, CreditCard, Gift, LockKeyhole } from "lucide-react";
import { useAge, useCart } from "../../lib/store";
import { formatMinor } from "../../lib/utils";
import { submitCheckout } from "../../lib/api";
import { ProductVisual } from "./product-visual";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

const STEPS = ["Contact", "Delivery", "Review", "Payment"];

export function CheckoutFlow({ shippingMethods = [] }) {
  const { items, ready, subtotalMinor, discountMinor, deliveryMinor, totalMinor, pointsPreview, refresh } = useCart();
  const { subjectKey } = useAge();
  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState(null);
  const [apiError, setApiError] = useState("");
  const [form, setForm] = useState({
    email: "",
    phone: "",
    name: "",
    address: "",
    address2: "",
    city: "",
    county: "",
    postcode: "",
    shippingMethodCode: shippingMethods[0]?.code ?? "tracked-24",
    card: "",
    expiry: "",
    cvc: "",
  });
  const [errors, setErrors] = useState({});

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(current) {
    const e = {};
    if (current === 0) {
      if (!form.email.includes("@")) e.email = "Enter a valid email";
      if (form.phone.trim().length < 7) e.phone = "Enter a phone number";
    }
    if (current === 1) {
      if (!form.name.trim()) e.name = "Required";
      if (!form.address.trim()) e.address = "Required";
      if (!form.city.trim()) e.city = "Required";
      if (form.postcode.trim().length < 5) e.postcode = "Enter a valid postcode";
    }
    if (current === 3) {
      if (form.card.replace(/\s/g, "").length < 12) e.card = "Enter a card number";
      if (!/^\d{2}\s*\/\s*\d{2}$/.test(form.expiry)) e.expiry = "MM / YY";
      if (form.cvc.trim().length < 3) e.cvc = "3 digits";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validate(step)) setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  async function placeOrder() {
    if (!validate(3)) return;
    setPlacing(true);
    setApiError("");
    try {
      const result = await submitCheckout({
        email: form.email,
        address: {
          fullName: form.name,
          line1: form.address,
          line2: form.address2 || undefined,
          city: form.city,
          county: form.county || undefined,
          postcode: form.postcode,
        },
        shippingMethodCode: form.shippingMethodCode,
        ageVerificationSubjectKey: subjectKey,
      });
      setOrder(result);
      await refresh();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setApiError(error.body?.message || "We couldn't place your order. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  if (order) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Check className="h-10 w-10" />
        </span>
        <h1 className="mt-6 text-4xl font-black tracking-tight text-foreground">Order confirmed</h1>
        <p className="mt-3 text-base font-bold text-muted-foreground">
          Thank you. A confirmation email has been sent to {form.email}.
        </p>
        <div className="mx-auto mt-6 max-w-sm rounded-xl border border-border bg-card p-6 text-left shadow-sm">
          <SummaryRow label="Order reference" value={order.orderNumber} />
          <SummaryRow label="Total paid" value={formatMinor(order.totalMinor)} />
          <div className="flex items-center justify-between pt-3">
            <span className="font-bold text-muted-foreground">Status</span>
            <strong className="capitalize text-primary">{order.status.replace("_", " ")}</strong>
          </div>
        </div>
        <p className="mt-4 text-sm font-bold text-muted-foreground">
          Orders before 2pm Monday–Friday dispatch the same day via Royal Mail Tracked 24.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/shop">Continue shopping</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </section>
    );
  }

  if (ready && items.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Your basket is empty</h1>
        <p className="mt-3 text-base font-bold text-muted-foreground">Add products before checking out.</p>
        <Button className="mt-6" asChild>
          <Link href="/shop">Go to shop</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_390px]">
      <div>
        <ol className="mb-6 flex flex-wrap items-center gap-2">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black transition ${
                  i === step
                    ? "bg-primary text-primary-foreground"
                    : i < step
                      ? "bg-secondary text-foreground"
                      : "bg-card text-muted-foreground"
                }`}
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-black/10 text-[0.7rem]">
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                {label}
              </button>
              {i < STEPS.length - 1 ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> : null}
            </li>
          ))}
        </ol>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
          {step === 0 ? (
            <StepShell title="Contact details" subtitle="For order updates and delivery tracking.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email address" value={form.email} onChange={(v) => set("email", v)} error={errors.email} type="email" placeholder="you@example.com" />
                <Field label="Phone number" value={form.phone} onChange={(v) => set("phone", v)} error={errors.phone} type="tel" placeholder="01733 000000" />
              </div>
            </StepShell>
          ) : null}

          {step === 1 ? (
            <StepShell title="Delivery address" subtitle="UK delivery via Royal Mail tracked services.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" value={form.name} onChange={(v) => set("name", v)} error={errors.name} wide />
                <Field label="Address" value={form.address} onChange={(v) => set("address", v)} error={errors.address} wide placeholder="Street address" />
                <Field label="Address line 2 (optional)" value={form.address2} onChange={(v) => set("address2", v)} wide />
                <Field label="Town / City" value={form.city} onChange={(v) => set("city", v)} error={errors.city} />
                <Field label="Postcode" value={form.postcode} onChange={(v) => set("postcode", v)} error={errors.postcode} placeholder="PE1 5UH" />
              </div>

              {shippingMethods.length ? (
                <div className="mt-6">
                  <p className="text-sm font-black text-foreground">Delivery method</p>
                  <RadioGroup
                    className="mt-3"
                    value={form.shippingMethodCode}
                    onValueChange={(v) => set("shippingMethodCode", v)}
                  >
                    {shippingMethods.map((method) => (
                      <label
                        key={method.code}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-border bg-muted p-4"
                      >
                        <span className="flex items-center gap-3">
                          <RadioGroupItem value={method.code} id={method.code} />
                          <span>
                            <strong className="block text-sm font-black text-foreground">{method.label}</strong>
                            <span className="text-xs font-bold text-muted-foreground">{method.etaLabel}</span>
                          </span>
                        </span>
                        <strong className="text-sm font-black text-foreground">{formatMinor(method.priceMinor)}</strong>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              ) : null}
            </StepShell>
          ) : null}

          {step === 2 ? (
            <StepShell title="Review your order" subtitle="Check line items before moving to payment.">
              <div className="grid gap-2 rounded-3xl bg-muted p-4">
                {items.map((item) => (
                  <div key={item.itemId} className="flex items-center gap-3 text-sm font-bold text-foreground">
                    <ProductVisual product={{ categorySlug: item.category }} className="h-10 w-10 shrink-0 rounded-xl" iconClassName="h-4 w-4" />
                    <span className="min-w-0 flex-1 truncate">
                      {item.qty} × {item.name}
                      {item.strength ? ` (${item.strength})` : ""}
                    </span>
                    <span>{formatMinor(item.lineTotalMinor)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                By continuing you confirm the delivery address above is correct and you are the
                account holder or authorised to place this order.
              </p>
            </StepShell>
          ) : null}

          {step === 3 ? (
            <StepShell title="Payment" subtitle="Card fields represent PCI-scoped hosted fields from the payment provider.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Card number" value={form.card} onChange={(v) => set("card", v)} error={errors.card} placeholder="4242 4242 4242 4242" wide />
                <Field label="Expiry" value={form.expiry} onChange={(v) => set("expiry", v)} error={errors.expiry} placeholder="MM / YY" />
                <Field label="CVC" value={form.cvc} onChange={(v) => set("cvc", v)} error={errors.cvc} placeholder="123" />
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <LockKeyhole className="h-4 w-4 text-primary" /> Secured checkout. Payment is confirmed by the
                configured payment provider on order creation.
              </p>
              {apiError ? <p className="mt-3 text-sm font-bold text-destructive">{apiError}</p> : null}
            </StepShell>
          ) : null}

          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" onClick={() => (step === 0 ? window.history.back() : setStep((s) => s - 1))}>
              {step === 0 ? "Back to basket" : "Back"}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={next}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={placeOrder} disabled={placing}>
                <LockKeyhole className="h-4 w-4" /> {placing ? "Placing order…" : "Place secure order"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <aside className="rounded-xl border border-border bg-surface-dark p-6 text-surface-dark-foreground shadow-xl lg:sticky lg:top-40 lg:self-start">
        <h2 className="text-2xl font-black tracking-tight">Your order</h2>
        <div className="mt-5 max-h-64 space-y-3 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.itemId} className="flex items-center gap-3">
              <ProductVisual product={{ categorySlug: item.category }} className="h-12 w-12 flex-none rounded-2xl" iconClassName="h-5 w-5" />
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-black">{item.name}</strong>
                <span className="text-xs font-bold text-surface-dark-muted">Qty {item.qty}</span>
              </div>
              <span className="text-sm font-black">{formatMinor(item.lineTotalMinor)}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-2 border-t border-surface-dark-border pt-4 text-sm font-bold text-surface-dark-muted">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-surface-dark-foreground">{formatMinor(subtotalMinor)}</span>
          </div>
          {discountMinor > 0 ? (
            <div className="flex justify-between">
              <span>Discount</span>
              <span className="text-primary">-{formatMinor(discountMinor)}</span>
            </div>
          ) : null}
          <div className="flex justify-between">
            <span>Delivery</span>
            <span className="text-surface-dark-foreground">{deliveryMinor === 0 ? "Free" : formatMinor(deliveryMinor)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-base font-black text-surface-dark-foreground">
            <span>Total</span>
            <span>{formatMinor(totalMinor)}</span>
          </div>
        </div>
        <div className="mt-5 rounded-3xl bg-primary p-4 text-sm font-black leading-6 text-primary-foreground">
          <Gift className="mb-1 h-5 w-5" />
          You'll earn {pointsPreview} loyalty points on this order.
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-surface-dark-muted">
          <CreditCard className="h-4 w-4 text-primary" /> Stripe-ready payment provider abstraction
        </div>
      </aside>
    </section>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3">
      <span className="font-bold text-muted-foreground">{label}</span>
      <strong className="text-foreground">{value}</strong>
    </div>
  );
}

function StepShell({ title, subtitle, children }) {
  return (
    <div>
      <h2 className="text-2xl font-black tracking-tight text-foreground">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm font-bold text-muted-foreground">{subtitle}</p> : null}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, error, type = "text", placeholder, wide = false }) {
  return (
    <div className={wide ? "grid gap-1.5 sm:col-span-2" : "grid gap-1.5"}>
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={error ? "border-destructive ring-2 ring-destructive/15" : ""}
      />
      {error ? <span className="text-xs font-black text-destructive">{error}</span> : null}
    </div>
  );
}
