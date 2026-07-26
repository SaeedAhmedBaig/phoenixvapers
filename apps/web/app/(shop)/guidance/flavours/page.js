import Link from "next/link";

import { SectionEyebrow } from "@/components/home/section-eyebrow";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Flavour finder" };

const PROFILES = [
  { name: "Tobacco", desc: "Familiar, restrained profiles for switchers from cigarettes.", href: "/c/e-liquids" },
  { name: "Menthol & mint", desc: "Cool, clean finishes — popular with ex-menthol smokers.", href: "/c/e-liquids" },
  { name: "Fruit", desc: "Berry, citrus, and tropical — balanced, not confectionery-sweet.", href: "/c/e-liquids" },
  { name: "Dessert", desc: "Bakery and cream notes for experienced vapers.", href: "/c/e-liquids" },
  { name: "Beverage", desc: "Cola, coffee, and botanical — adult profiles.", href: "/c/e-liquids" },
];

export default function FlavourFinderPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <SectionEyebrow>Guidance</SectionEyebrow>
      <h1 className="font-display mt-2 text-3xl font-medium">Flavour finder</h1>
      <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
        Flavour names describe the flavour — honestly and for adults. Use these profiles as a starting point, then filter the catalogue by type.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {PROFILES.map((p) => (
          <Link key={p.name} href={p.href} className="phx-card block p-5 transition-shadow hover:shadow-md">
            <h2 className="font-medium">{p.name}</h2>
            <p className="text-muted-foreground mt-2 text-sm">{p.desc}</p>
          </Link>
        ))}
      </div>

      <Button asChild variant="outline" className="mt-10 rounded-none">
        <Link href="/guidance">Back to guidance</Link>
      </Button>
    </div>
  );
}
