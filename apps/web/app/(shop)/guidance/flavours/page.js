import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SectionEyebrow } from "@/components/home/section-eyebrow";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Flavour finder" };

const PROFILES = [
  {
    name: "Tobacco",
    desc: "Familiar, restrained profiles for switchers from cigarettes. Not sweet, not artificial — the closest match to what you already know.",
    examples: "Classic tobacco, Virginia, RY4",
    query: "tobacco",
  },
  {
    name: "Menthol & mint",
    desc: "Cool, clean finishes — popular with ex-menthol smokers and as a palate cleanser between other flavours.",
    examples: "Menthol, spearmint, ice",
    query: "menthol",
  },
  {
    name: "Fruit",
    desc: "Berry, citrus, and tropical — balanced, not confectionery-sweet. The largest and most varied category.",
    examples: "Mixed berry, mango, citrus",
    query: "fruit",
  },
  {
    name: "Dessert",
    desc: "Bakery and cream notes for experienced vapers who want something richer as an occasional change.",
    examples: "Custard, vanilla, bakery",
    query: "dessert",
  },
  {
    name: "Beverage",
    desc: "Cola, coffee, and botanical profiles — adult, restrained, and distinct from anything aimed at younger palates.",
    examples: "Cola, coffee, cream soda",
    query: "cola",
  },
];

export default function FlavourFinderPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <SectionEyebrow>Guidance</SectionEyebrow>
      <h1 className="font-display mt-2 text-3xl font-medium">Flavour finder</h1>
      <p className="text-muted-foreground mt-4 text-base leading-relaxed">
        Flavour names describe the flavour — honestly and for adults, never aimed at appealing to anyone under 18. Use these profiles as a starting point, then search or filter the catalogue for the exact bottle.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {PROFILES.map((p) => (
          <SpotlightCard key={p.name} href={`/search?q=${encodeURIComponent(p.query)}`} className="flex flex-col p-5">
            <h2 className="font-medium">{p.name}</h2>
            <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">{p.desc}</p>
            <p className="text-muted-foreground mt-3 text-xs">{p.examples}</p>
            <span className="text-pine mt-4 inline-flex items-center gap-1 text-sm font-medium group-hover:underline">
              Search {p.name.toLowerCase()} <ArrowRight className="size-3.5" />
            </span>
          </SpotlightCard>
        ))}
      </div>

      <p className="text-muted-foreground mt-8 text-sm leading-relaxed">
        Can&apos;t find what you&apos;re after? Every product page lists the full specification — strength, VG/PG ratio, and ingredients — so you know exactly what&apos;s in the bottle before you buy.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild className="rounded-none"><Link href="/c/e-liquids">Browse all e-liquids</Link></Button>
        <Button asChild variant="outline" className="rounded-none"><Link href="/guidance">Back to guidance</Link></Button>
      </div>
    </div>
  );
}
