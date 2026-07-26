"use client";

const MSGS = [
  "Free tracked delivery on orders over £30",
  "Same-day dispatch before 2pm · Mon–Fri",
  "Duty-inclusive pricing on every product",
  "18+ only · Age verified at checkout and on delivery",
  "UK-made · Batch-tested · MHRA notified",
];

/** Service/compliance ticker — Ink Green bar, bone text (green as accent, not wallpaper). */
export function Announcement() {
  const items = [...MSGS, ...MSGS];
  return (
    <div className="bg-chrome text-chrome-fg h-9 overflow-hidden border-b border-white/10" aria-label="Service announcements">
      <div className="animate-marquee flex w-max items-center gap-12 py-2.5">
        {items.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-4 text-[11px] font-medium tracking-wide">
            <span className="bg-primary size-1.5 shrink-0 rounded-full" aria-hidden />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
