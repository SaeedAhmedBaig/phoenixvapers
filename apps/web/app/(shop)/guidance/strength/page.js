import Link from "next/link";

import { SectionEyebrow } from "@/components/home/section-eyebrow";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Strength guide" };

const LEVELS = [
  { strength: "3mg/ml", for: "Light smokers or stepping down from 6mg", note: "Common in shortfills after adding a nic shot" },
  { strength: "6mg/ml", for: "Moderate smokers (~10 per day)", note: "A sensible starting point for many switchers on MTL" },
  { strength: "12mg/ml", for: "Heavier smokers (~15 per day)", note: "Often used in 50/50 freebase 10ml" },
  { strength: "18–20mg/ml", for: "Heavy smokers or nic salt users", note: "Salts deliver smoothly at higher strengths in pods" },
];

export default function StrengthGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <SectionEyebrow>Guidance</SectionEyebrow>
      <h1 className="font-display mt-2 text-3xl font-medium">Strength guide</h1>
      <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
        Match nicotine strength to your current intake. This is guidance, not medical advice — adjust based on how you feel and speak to a specialist if unsure.
      </p>

      <div className="mt-10 space-y-4">
        {LEVELS.map((l) => (
          <div key={l.strength} className="phx-card p-5">
            <p className="font-mono text-pine text-lg font-semibold">{l.strength}</p>
            <p className="mt-2 font-medium">{l.for}</p>
            <p className="text-muted-foreground mt-1 text-sm">{l.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild className="rounded-none"><Link href="/c/nic-salts">Shop nic salts</Link></Button>
        <Button asChild variant="outline" className="rounded-none"><Link href="/guidance">Back to guidance</Link></Button>
      </div>
    </div>
  );
}
