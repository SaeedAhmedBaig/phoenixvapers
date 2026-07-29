"use client";

/**
 * Brands-we-stock strip — a continuously-looping wordmark marquee (the
 * ReactBits "Logo Loop" pattern: seamless repeat, pause on hover), reusing
 * this project's existing `.animate-marquee` keyframe/reduced-motion setup
 * (see components/layout/announcement.jsx) rather than a second animation
 * system. Real wordmarks only — the brands actually in the catalogue, not
 * invented press logos or partnerships.
 */
const BRANDS = [
  "Cedar Reserve",
  "Bar Wars",
  "FiftyFifty Smooth",
  "Uwell",
  "Smok",
  "Nitecore",
  "Hurb",
  "Z Virus",
];

export function LogoLoop() {
  const items = [...BRANDS, ...BRANDS];
  return (
    <div
      className="border-border bg-card overflow-hidden border-y py-6 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      aria-label="Brands we stock"
    >
      <div className="animate-marquee hover:[animation-play-state:paused] flex w-max items-center gap-12">
        {items.map((name, i) => (
          <span
            key={i}
            className="text-muted-foreground/70 font-display shrink-0 px-2 text-xl font-medium tracking-tight sm:text-2xl"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
