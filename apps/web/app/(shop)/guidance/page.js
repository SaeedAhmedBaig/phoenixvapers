import Link from "next/link";
import { ArrowRight, BookOpen, Scale } from "lucide-react";

import { SectionEyebrow } from "@/components/home/section-eyebrow";
import { Button } from "@/components/ui/button";

export const metadata = { title: "New to vaping" };

const PATHS = [
  {
    icon: BookOpen,
    title: "Start here",
    desc: "A plain introduction for adults switching from cigarettes. No jargon, no pressure.",
    href: "/guidance/strength",
    cta: "Strength guide first",
  },
  {
    icon: Scale,
    title: "Match your strength",
    desc: "Use your current cigarette intake to estimate a sensible starting mg/ml.",
    href: "/guidance/strength",
    cta: "Open strength guide",
  },
];

export default function GuidancePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <SectionEyebrow>Discover</SectionEyebrow>
      <h1 className="font-display mt-2 text-3xl font-medium sm:text-4xl">New to vaping</h1>
      <p className="text-muted-foreground mt-4 text-base leading-relaxed">
        Switching from cigarettes is a considered choice. We will help you match strength, device, and flavour without hype or pressure. Every product we sell is UK-made, batch-tested, and duty-inclusive.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {PATHS.map((p) => (
          <div key={p.title} className="phx-card p-6">
            <p.icon className="text-pine size-6" />
            <h2 className="mt-4 text-lg font-medium">{p.title}</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{p.desc}</p>
            <Link href={p.href} className="text-pine mt-4 inline-flex items-center gap-1 text-sm font-medium hover:underline">
              {p.cta} <ArrowRight className="size-3.5" />
            </Link>
          </div>
        ))}
      </div>

      <div className="phx-card mt-10 p-6">
        <h2 className="font-medium">What we recommend for switchers</h2>
        <ul className="text-muted-foreground mt-4 list-inside list-disc space-y-2 text-sm">
          <li>Start with a pod device and a 10ml nic salt close to your current intake</li>
          <li>Choose a simple flavour — tobacco or menthol — before exploring profiles</li>
          <li>Read the specification on every product page before you order</li>
          <li>Verify your age at checkout — it takes under a minute</li>
        </ul>
        <Button asChild className="mt-6 rounded-none">
          <Link href="/c/nic-salts">Browse nic salts</Link>
        </Button>
      </div>
    </div>
  );
}
