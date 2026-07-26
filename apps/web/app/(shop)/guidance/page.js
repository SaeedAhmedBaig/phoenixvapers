import Link from "next/link";
import { ArrowRight, Beaker, Scale, ShieldCheck, Sparkles, UserPlus } from "lucide-react";

import { SectionEyebrow } from "@/components/home/section-eyebrow";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "New to vaping" };

const GUIDES = [
  {
    icon: Scale,
    tag: "Step 1",
    title: "Strength guide",
    desc: "Match nicotine strength to your current cigarette intake, and understand nic salts vs freebase.",
    href: "/guidance/strength",
  },
  {
    icon: Beaker,
    tag: "Step 2",
    title: "Device chooser",
    desc: "Pod, MTL, or sub-ohm — what each one feels like and which suits your strength.",
    href: "/guidance/devices",
  },
  {
    icon: Sparkles,
    tag: "Step 3",
    title: "Flavour finder",
    desc: "Five honest flavour profiles, from tobacco to dessert, so the first bottle isn't a guess.",
    href: "/guidance/flavours",
  },
];

const REASSURANCE = [
  {
    icon: UserPlus,
    title: "No pressure, no upsell",
    desc: "This guidance exists to help you order the right thing once — not to sell you the most expensive option.",
  },
  {
    icon: ShieldCheck,
    title: "Age verification is care, not a barrier",
    desc: "We check you're 18+ at checkout and again at your door. It protects everyone, and it takes under a minute.",
  },
];

const FAQ = [
  {
    q: "Is vaping a good way to move away from cigarettes?",
    a: "We sell to adults who already smoke or vape, and we present factual product information — strength, ingredients, and specification — so you can make an informed choice. We do not make medical or cessation claims; speak to a healthcare professional for advice specific to you.",
  },
  {
    q: "What if I choose the wrong strength or flavour?",
    a: "Start with our recommendations below. Unopened products can be returned within our published returns policy if something isn't right for you.",
  },
  {
    q: "Do I need an account to browse?",
    a: "No — browse and add to basket as a guest. You'll need a verified account only to complete a purchase, since UK law requires an age check before any nicotine product ships.",
  },
];

export default function GuidancePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <SectionEyebrow>Discover</SectionEyebrow>
      <h1 className="font-display mt-2 text-3xl font-medium sm:text-4xl">New to vaping</h1>
      <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed">
        Switching from cigarettes is a considered choice. We&apos;ll help you match strength, device, and flavour without hype or pressure — in that order, because each decision depends on the last. Every product we sell is UK-made, batch-tested, and duty-inclusive.
      </p>

      {/* The three-step path */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {GUIDES.map((g) => (
          <SpotlightCard key={g.title} href={g.href} className="flex flex-col p-5">
            <div className="mb-3 flex items-start justify-between">
              <span className="bg-accent text-pine rounded-none px-2.5 py-0.5 text-[10px] font-semibold uppercase">{g.tag}</span>
              <g.icon className="text-pine size-5 opacity-70" />
            </div>
            <h2 className="font-medium">{g.title}</h2>
            <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">{g.desc}</p>
            <span className="text-pine mt-4 inline-flex items-center gap-1 text-sm font-medium group-hover:underline">
              Open guide <ArrowRight className="size-3.5" />
            </span>
          </SpotlightCard>
        ))}
      </div>

      {/* Quick recommendations for the impatient */}
      <div className="phx-card mt-10 p-6">
        <h2 className="font-medium">In a hurry? Our default recommendation</h2>
        <ul className="text-muted-foreground mt-4 list-inside list-disc space-y-2 text-sm leading-relaxed">
          <li>A pod device and a 10ml nic salt close to your current cigarette intake (see the strength guide for exact mg/ml)</li>
          <li>A simple flavour — tobacco or menthol — before exploring fruit or dessert profiles</li>
          <li>The full specification on every product page, read before you order</li>
          <li>Age verification at checkout — it takes under a minute and only happens once</li>
        </ul>
        <Button asChild className="mt-6 rounded-none">
          <Link href="/c/nic-salts">Browse nic salts</Link>
        </Button>
      </div>

      {/* Reassurance */}
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {REASSURANCE.map((r) => (
          <div key={r.title} className="phx-card flex gap-4 p-5">
            <r.icon className="text-primary mt-0.5 size-5 shrink-0" />
            <div>
              <h3 className="font-medium">{r.title}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-12">
        <SectionEyebrow>Common questions</SectionEyebrow>
        <h2 className="font-display mt-2 text-xl font-medium">Before you start</h2>
        <div className="mt-6 space-y-4">
          {FAQ.map((item) => (
            <details key={item.q} className="phx-card group p-5">
              <summary className="cursor-pointer list-none font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                {item.q}
              </summary>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
