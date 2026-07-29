import Link from "next/link";
import { ArrowRight, Battery, CircleDot, Layers, Zap } from "lucide-react";

import { FaqAccordion } from "@/components/home/faq-accordion";
import { SectionEyebrow } from "@/components/home/section-eyebrow";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Device chooser" };

const DEVICE_TYPES = [
  {
    icon: CircleDot,
    name: "Pod systems",
    tag: "Most switchers start here",
    desc: "Small, simple, and closed or refillable. Draw-activated or single-button. Paired with nic salts for a smooth, cigarette-like hit at higher strengths.",
    href: "/c/hardware-kits",
  },
  {
    icon: Layers,
    name: "MTL kits",
    tag: "Mouth-to-lung",
    desc: "You draw into your mouth first, then inhale — the closest sensation to a cigarette. Works well with higher-strength nic salts or 50/50 e-liquid.",
    href: "/c/hardware-kits",
  },
  {
    icon: Zap,
    name: "DTL / sub-ohm mods",
    tag: "Direct-to-lung",
    desc: "Bigger clouds, warmer vapour, lower nicotine strengths. Suits high-VG shortfills. Usually a second device once you know what you like.",
    href: "/c/hardware-kits",
  },
  {
    icon: Battery,
    name: "Coils & consumables",
    tag: "Keep it running",
    desc: "Every device needs replacement coils or pods on a schedule — usually every 1–2 weeks with regular use. Filter by your exact device to find a match.",
    href: "/c/coils-consumables",
  },
];

const QUESTIONS = [
  {
    q: "Draw-activated or button?",
    a: "Draw-activated pods are simplest — inhale and it fires, nothing to press. Button-fire kits give more control (and usually more power) once you're comfortable.",
  },
  {
    q: "Refillable or pre-filled pods?",
    a: "Refillable pods work with any 10ml e-liquid or nic salt, so you can experiment with flavours freely. Pre-filled pods are simpler but limit you to that brand's range.",
  },
  {
    q: "How do I know it's compatible with a coil or pod?",
    a: "Every coil and pod on the catalogue names the exact devices it fits — filter the Coils & Consumables category by device to see only what matches yours.",
  },
];

export default function DeviceChooserPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <SectionEyebrow>Discover</SectionEyebrow>
      <h1 className="font-display mt-2 text-3xl font-medium sm:text-4xl">Device chooser</h1>
      <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed">
        The device shapes everything else — how strong your e-liquid should be, how it feels, and how often you&apos;ll be back for consumables. Here&apos;s the difference in plain terms.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {DEVICE_TYPES.map((d) => (
          <SpotlightCard key={d.name} href={d.href} className="flex flex-col p-5">
            <div className="mb-3 flex items-start justify-between">
              <span className="bg-accent text-pine rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase">{d.tag}</span>
              <d.icon className="text-pine size-5 opacity-70" />
            </div>
            <h2 className="font-medium">{d.name}</h2>
            <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">{d.desc}</p>
            <span className="text-pine mt-4 inline-flex items-center gap-1 text-sm font-medium group-hover:underline">
              Shop this range <ArrowRight className="size-3.5" />
            </span>
          </SpotlightCard>
        ))}
      </div>

      <div className="mt-12">
        <SectionEyebrow>Common questions</SectionEyebrow>
        <h2 className="font-display mt-2 text-xl font-medium">Choosing between devices</h2>
        <div className="mt-6">
          <FaqAccordion items={QUESTIONS} />
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild className=""><Link href="/guidance/strength">Match your strength next</Link></Button>
        <Button asChild variant="outline" className=""><Link href="/guidance">Back to guidance</Link></Button>
      </div>
    </div>
  );
}
