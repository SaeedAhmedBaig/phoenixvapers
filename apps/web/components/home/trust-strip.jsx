import { CheckCircle2 } from "lucide-react";

const TRUST_ITEMS = [
  "UK-made",
  "Batch-tested",
  "MHRA notified",
  "Duty-inclusive pricing",
  "Age-verified dispatch",
  "Challenge 25",
];

export function TrustStrip({ className = "" }) {
  return (
    <div className={`flex flex-wrap justify-center gap-x-6 gap-y-2 ${className}`}>
      {TRUST_ITEMS.map((item) => (
        <span key={item} className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
          <CheckCircle2 className="text-primary size-3.5 shrink-0" aria-hidden />
          {item}
        </span>
      ))}
    </div>
  );
}
