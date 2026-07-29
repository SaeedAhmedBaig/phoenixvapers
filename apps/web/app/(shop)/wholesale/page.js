import Link from "next/link";
import { Building2, FileText, Package, ShieldCheck, Store, Truck, UserCheck, Utensils, Wallet } from "lucide-react";

import { FaqAccordion } from "@/components/home/faq-accordion";
import { SectionEyebrow } from "@/components/home/section-eyebrow";
import { WholesaleInterestForm } from "@/components/home/wholesale-interest-form";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Wholesale" };

const VALUE_PROPS = [
  { icon: Wallet, title: "Verified trade pricing", desc: "Volume and tier pricing resolved by account, applied automatically at checkout — no quote requests." },
  { icon: Package, title: "Bulk ordering", desc: "Order by SKU list, CSV upload, or reorder from history in a few clicks — built for restocking a shop, not one bottle at a time." },
  { icon: UserCheck, title: "Credit terms", desc: "Established accounts can check out on invoice/net terms alongside card, once trade verification is complete." },
  { icon: FileText, title: "Compliance documentation", desc: "Every invoice itemises net, duty, and VAT, with product notification numbers and batch records attached — your own compliance obligations, covered." },
  { icon: Truck, title: "Palletised delivery", desc: "Trade-appropriate carriers and delivery for volume orders, alongside standard tracked shipping for smaller top-ups." },
  { icon: ShieldCheck, title: "Dedicated account management", desc: "A named Wholesale Account Manager for pricing, credit, and order questions — not a support queue." },
];

const SEGMENTS = [
  { icon: Store, title: "Independent vape shops", desc: "Full-range restocking with trade pricing on the same MHRA-notified, batch-tested lines your customers already trust." },
  { icon: Building2, title: "Convenience & newsagents", desc: "A curated core range sized for counter space, with the compliance paperwork your licence conditions require on file." },
  { icon: Utensils, title: "Hospitality & venues", desc: "Bars and venues offering vaping products for adult guests — trade terms, discreet delivery, and full documentation." },
];

const STEPS = [
  { step: "01", title: "Register your interest", desc: "Tell us about your business — company details and the retail licence status your locality requires." },
  { step: "02", title: "Verification", desc: "We verify your business and, as licensing matures, your retail licence — plus the identity of your authorised buyers." },
  { step: "03", title: "Account approved", desc: "A Wholesale Account Manager sets your trade price list, credit terms, and permitted product ranges." },
  { step: "04", title: "Order on trade terms", desc: "Trade pricing, bulk ordering, and compliance documentation are live on your account from day one." },
];

const COMPARISON = [
  { feature: "Pricing", retail: "Standard duty-inclusive retail price", trade: "Verified trade / volume tier pricing" },
  { feature: "Ordering", retail: "Single-basket checkout", trade: "SKU list, CSV upload, or reorder from history" },
  { feature: "Payment", retail: "Card at checkout", trade: "Card, or invoice/net terms once approved" },
  { feature: "Documentation", retail: "Standard order confirmation", trade: "Itemised invoice with duty, VAT, and batch records" },
];

const FAQ = [
  { q: "Who can open a trade account?", a: "Verified businesses — shops, stockists, and retailers who intend to resell. We verify the business and, as licensing matures, its retail licence, before trade pricing is enabled." },
  { q: "Is the trade portal live yet?", a: "Trade accounts are not yet open for self-service ordering. Register your interest below and our wholesale team will contact you as the portal opens." },
  { q: "What if I already have a trade account?", a: "Use Trade login below — it's the same sign-in as every Phoenix account, resolved to your trade terms automatically." },
];

export default function WholesalePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <SectionEyebrow>Trade</SectionEyebrow>
      <h1 className="font-display mt-2 text-3xl font-medium sm:text-4xl">Wholesale &amp; B2B</h1>
      <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed">
        Stock your shop with a supplier you can prove. Trade accounts get verified pricing, bulk ordering, credit terms, and compliance documentation on every invoice — the same manufacturing and compliance standard as our retail catalogue, at trade terms.
      </p>

      {/* Value props */}
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {VALUE_PROPS.map((v) => (
          <div key={v.title} className="phx-card flex gap-4 p-5">
            <v.icon className="text-primary mt-0.5 size-5 shrink-0" />
            <div>
              <h2 className="font-medium">{v.title}</h2>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{v.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Who we supply */}
      <div className="mt-14">
        <SectionEyebrow>Who we supply</SectionEyebrow>
        <h2 className="font-display mt-2 text-xl font-medium">Built for every kind of trade buyer</h2>
        <div className="divide-border mt-6 grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {SEGMENTS.map((s) => (
            <div key={s.title} className="flex flex-col items-center px-6 py-6 text-center first:pt-0 sm:py-0">
              <s.icon className="text-primary size-7" />
              <h3 className="mt-3 font-medium">{s.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="mt-14">
        <SectionEyebrow>How it works</SectionEyebrow>
        <h2 className="font-display mt-2 text-xl font-medium">From application to your first trade order</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.step} className="phx-card p-5">
              <span className="font-mono text-pine text-xs font-medium">{s.step}</span>
              <h3 className="mt-2 font-medium">{s.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Retail vs trade */}
      <div className="mt-14">
        <SectionEyebrow>At a glance</SectionEyebrow>
        <h2 className="font-display mt-2 text-xl font-medium">Retail vs. trade</h2>
        <div className="border-border mt-6 overflow-x-auto border">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-border bg-muted/50 border-b">
                <th className="px-4 py-3 text-left font-semibold">Feature</th>
                <th className="px-4 py-3 text-left font-semibold">Retail</th>
                <th className="text-pine px-4 py-3 text-left font-semibold">Trade</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.feature} className="border-border border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{row.feature}</td>
                  <td className="text-muted-foreground px-4 py-3">{row.retail}</td>
                  <td className="px-4 py-3">{row.trade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-14">
        <SectionEyebrow>Common questions</SectionEyebrow>
        <h2 className="font-display mt-2 text-xl font-medium">Before you register</h2>
        <div className="mt-6">
          <FaqAccordion items={FAQ} />
        </div>
      </div>

      {/* CTA */}
      <div className="mt-14">
        <div className="text-center">
          <SectionEyebrow>Get started</SectionEyebrow>
          <h2 className="font-display mt-2 text-xl font-medium">Register your interest</h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
            Trade accounts are opening soon. Tell us about your business and our wholesale team will be in touch.
          </p>
        </div>
        <div className="mt-6">
          <WholesaleInterestForm />
        </div>
        <div className="mt-4 text-center">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Already have a trade account? Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
