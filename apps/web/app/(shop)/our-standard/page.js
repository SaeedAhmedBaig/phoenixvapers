import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { SectionEyebrow } from "@/components/home/section-eyebrow";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Our Standard" };

const PILLARS = [
  { title: "UK manufacture", desc: "We make what we sell. Products are formulated and filled in our Peterborough facility — not white-label imports." },
  { title: "Batch testing", desc: "Every batch is independently risk-assessed. Assessments are available on request and in our stores." },
  { title: "MHRA notification", desc: "Every product is notified under the UK TPD framework before it is sold." },
  { title: "Duty-transparent pricing", desc: "Prices include vaping products duty and VAT. Expand any product for a full breakdown." },
  { title: "Age verification", desc: "We verify at checkout and on delivery where required. Challenge 25 is applied as care, not obstacle." },
  { title: "Honest stock", desc: "Out-of-stock products stay visible with notify-me — we do not hide availability." },
];

export default function OurStandardPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <SectionEyebrow>Trust</SectionEyebrow>
      <h1 className="font-display mt-2 text-3xl font-medium sm:text-4xl">Our Standard</h1>
      <p className="text-muted-foreground mt-4 text-base leading-relaxed">
        Phoenix Vapers engineers trust into every product. In an advertising-restricted market, our owned surfaces — packaging, website, email, and store — are where we prove that promise.
      </p>

      <div className="mt-12 space-y-5">
        {PILLARS.map((p) => (
          <div key={p.title} className="phx-card flex gap-4 p-6">
            <CheckCircle2 className="text-primary mt-0.5 size-5 shrink-0" />
            <div>
              <h2 className="font-medium">{p.title}</h2>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="phx-dark-band mt-14 rounded-none p-8 text-center">
        <p className="font-display text-xl font-medium">The Standard of Trust.</p>
        <p className="phx-dark-band-muted mx-auto mt-2 max-w-md text-sm">
          Calm, precise, adult. Evidence before adjectives.
        </p>
        <Button asChild className="mt-6 rounded-none">
          <Link href="/c/e-liquids">Shop the catalogue</Link>
        </Button>
      </div>
    </div>
  );
}
