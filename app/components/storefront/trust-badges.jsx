import { BadgeCheck, Clock3, CreditCard, MapPin, PackageCheck, ShieldCheck, Truck, UserCheck } from "lucide-react";
import { cn } from "../../lib/utils";

const TRUST_RAIL = [
  ["Age verified checkout", UserCheck],
  ["Batch-tested e-liquids", BadgeCheck],
  ["Tracked UK delivery", Truck],
  ["Secure payment ready", CreditCard],
];

export function TrustRail({ className }) {
  return (
    <div className={className ?? "grid gap-3 sm:grid-cols-2 lg:grid-cols-4"}>
      {TRUST_RAIL.map(([label, Icon]) => (
        <article key={label} className="flex items-center gap-3 rounded-3xl border border-border bg-card p-4 shadow-sm">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <strong className="text-sm font-black text-foreground">{label}</strong>
        </article>
      ))}
    </div>
  );
}

export const commerceTrust = [
  { title: "Age Verification", text: "Structural checkout gate, ready for AgeChecked, 1account, or AgeVerifyUK.", icon: UserCheck },
  { title: "Delivery Promise", text: "Royal Mail Tracked 24/48 messaging and free delivery threshold shown early.", icon: PackageCheck },
  { title: "Compliance Layer", text: "18+ notices, nicotine warnings, batch testing, and safety content throughout.", icon: ShieldCheck },
  { title: "Support Ready", text: "Live chat, phone, email, returns, and store assistance stay visible while shopping.", icon: Clock3 },
  { title: "Retail Footprint", text: "Store finder with postcode search and branch availability.", icon: MapPin },
];

export function CommerceTrustGrid({ className }) {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-5", className)}>
      {commerceTrust.map(({ title, text, icon: Icon }) => (
        <article key={title} className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <h3 className="mt-4 text-base font-black text-foreground">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
        </article>
      ))}
    </div>
  );
}
