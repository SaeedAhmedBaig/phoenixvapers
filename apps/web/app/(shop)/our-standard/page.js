import Link from "next/link";
import { Ban, Beaker, CheckCircle2, Eye, FileCheck2, ShieldCheck } from "lucide-react";

import { FaqAccordion } from "@/components/home/faq-accordion";
import { SectionEyebrow } from "@/components/home/section-eyebrow";
import { RevealHeading } from "@/components/motion/reveal-heading";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Our Standard" };

const PROCESS = [
  { step: "01", title: "Made, not imported", desc: "Formulated and filled in our own Peterborough facility — we control the process end to end, not a white-label import." },
  { step: "02", title: "Tested before it ships", desc: "Every batch is independently risk-assessed before it reaches the catalogue. Assessments are available on request." },
  { step: "03", title: "Priced and notified honestly", desc: "Every product is notified under the UK TPD framework and priced with duty and VAT included — no surprise line items at checkout." },
];

const PILLARS = [
  { icon: Beaker, title: "UK manufacture", desc: "We make what we sell. Products are formulated and filled in our Peterborough facility — not white-label imports rebadged with our name." },
  { icon: FileCheck2, title: "Batch testing", desc: "Every batch is independently risk-assessed before sale. Assessments are available on request and in our stores." },
  { icon: ShieldCheck, title: "MHRA notification", desc: "Every product is notified under the UK TPD framework before it is sold — strength, ingredients, and emissions on record." },
  { icon: CheckCircle2, title: "Duty-transparent pricing", desc: "Prices include Vaping Products Duty and VAT. Expand any product for the full net, duty, and VAT breakdown before you order." },
  { icon: Eye, title: "Age verification", desc: "We verify at checkout and again on delivery where required. Challenge 25 is applied as care, not an obstacle — for everyone's protection." },
  { icon: Ban, title: "No disposables", desc: "Single-use disposable vapes are structurally excluded from our catalogue — refillable and reusable formats only, by policy and by design." },
];

const FAQ = [
  { q: "What does 'batch-tested' actually mean?", a: "Each production batch is independently risk-assessed before it's released for sale — checking it matches its declared specification. Assessment records are available on request." },
  { q: "Why do prices already include duty?", a: "Vaping Products Duty applies to all vaping liquid from 1 October 2026, including 0mg. We show it inline rather than adding it at checkout, so the price you see is the price you pay." },
  { q: "Why verify age twice — at checkout and delivery?", a: "UK law requires it, and it's the right thing to do regardless. Checkout confirms the account holder is verified; delivery confirms the person accepting the parcel is too." },
];

export default function OurStandardPage() {
  return (
    <div>
      <div className="phx-hero border-border border-b">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
          <SectionEyebrow>Trust</SectionEyebrow>
          <RevealHeading
            className="font-display mt-2 text-3xl font-medium sm:text-4xl"
            words={[{ text: "Our" }, { text: "Standard" }]}
          />
          <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed">
            Phoenix Vapers engineers trust into every product. In an advertising-restricted market, our owned surfaces — packaging, website, and store — are where we prove that promise, not just claim it.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
        {/* How we work */}
        <div className="grid gap-5 sm:grid-cols-3">
          {PROCESS.map((p) => (
            <div key={p.step} className="phx-card p-5">
              <span className="font-mono text-pine text-xs font-medium">{p.step}</span>
              <h2 className="mt-2 font-medium">{p.title}</h2>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* The six pillars, as a proper grid with icons */}
        <div className="mt-14">
          <SectionEyebrow>The standard, in full</SectionEyebrow>
          <h2 className="font-display mt-2 text-2xl font-medium">Six commitments, no exceptions</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {PILLARS.map((p) => (
              <div key={p.title} className="phx-card flex gap-4 p-6">
                <p.icon className="text-primary mt-0.5 size-5 shrink-0" />
                <div>
                  <h3 className="font-medium">{p.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-14">
          <SectionEyebrow>Common questions</SectionEyebrow>
          <h2 className="font-display mt-2 text-xl font-medium">Proving the standard</h2>
          <div className="mt-6">
            <FaqAccordion items={FAQ} />
          </div>
        </div>

        <div className="phx-dark-band mt-14 p-8 text-center">
          <p className="font-display text-xl font-medium">The Standard of Trust.</p>
          <p className="phx-dark-band-muted mx-auto mt-2 max-w-md text-sm">
            Calm, precise, adult. Evidence before adjectives.
          </p>
          <Button asChild className="mt-6">
            <Link href="/c/e-liquids">Shop the catalogue</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
