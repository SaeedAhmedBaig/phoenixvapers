import Link from "next/link";
import { ArrowRight, Droplet, FlaskConical } from "lucide-react";

import { SectionEyebrow } from "@/components/home/section-eyebrow";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Strength guide" };

const LEVELS = [
  {
    strength: "3mg/ml",
    for: "Light smokers, or stepping down from 6mg",
    note: "Common in shortfills after adding a 10ml nic shot — check the bottle's total volume before adding one.",
    href: "/c/e-liquids?strengthMgPerMl=3",
  },
  {
    strength: "6mg/ml",
    for: "Moderate smokers (around 10 per day)",
    note: "A sensible starting point for many switchers using MTL (mouth-to-lung) devices.",
    href: "/c/e-liquids?strengthMgPerMl=6",
  },
  {
    strength: "12mg/ml",
    for: "Heavier smokers (around 15 per day)",
    note: "Often used in 50/50 VG/PG freebase e-liquid — a balance of throat hit and vapour.",
    href: "/c/e-liquids?strengthMgPerMl=12",
  },
  {
    strength: "18–20mg/ml",
    for: "Heavy smokers, or anyone using nic salts",
    note: "Salts deliver smoothly at higher strengths in small pod devices — see the callout below.",
    href: "/c/nic-salts?strengthMgPerMl=18,20",
  },
];

export default function StrengthGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <SectionEyebrow>Guidance</SectionEyebrow>
      <h1 className="font-display mt-2 text-3xl font-medium">Strength guide</h1>
      <p className="text-muted-foreground mt-4 text-base leading-relaxed">
        Nicotine strength is measured in milligrams per millilitre (mg/ml) — the amount of nicotine in every millilitre of e-liquid. Match it to your current intake as a starting point, then adjust based on how you feel. This is guidance, not medical advice; speak to a specialist if you&apos;re unsure.
      </p>

      {/* Freebase vs nic salt — the distinction that actually matters */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="phx-card p-5">
          <FlaskConical className="text-pine size-5" />
          <h2 className="mt-3 font-medium">Freebase nicotine</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            The traditional form, found in most e-liquids and shortfills. Delivers a stronger throat hit at higher strengths, so it&apos;s usually capped around 12–18mg/ml for comfortable use in sub-ohm and MTL devices.
          </p>
        </div>
        <div className="phx-card p-5">
          <Droplet className="text-pine size-5" />
          <h2 className="mt-3 font-medium">Nicotine salts</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            A smoother chemical form that carries higher strengths (18–20mg/ml) without harshness — the reason pod systems and nic salts are usually paired. TPD limits nic salt containers to 10ml at up to 20mg/ml.
          </p>
        </div>
      </div>

      {/* Strength levels with real, working filter deep-links */}
      <div className="mt-10 space-y-4">
        {LEVELS.map((l) => (
          <Link key={l.strength} href={l.href} className="phx-card group flex flex-wrap items-center justify-between gap-4 p-5 transition-colors hover:border-primary/25">
            <div>
              <p className="font-mono text-pine text-lg font-semibold">{l.strength}</p>
              <p className="mt-2 font-medium">{l.for}</p>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{l.note}</p>
            </div>
            <span className="text-pine inline-flex shrink-0 items-center gap-1 text-sm font-medium group-hover:underline">
              Shop this strength <ArrowRight className="size-3.5" />
            </span>
          </Link>
        ))}
      </div>

      <p className="text-muted-foreground mt-6 text-xs leading-relaxed">
        UK law caps all nicotine-containing e-liquid at 20mg/ml. Every strength shown here is a starting reference, not a recommendation to increase your nicotine intake over time.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild className="rounded-none"><Link href="/guidance/devices">Next: choose a device</Link></Button>
        <Button asChild variant="outline" className="rounded-none"><Link href="/guidance">Back to guidance</Link></Button>
      </div>
    </div>
  );
}
