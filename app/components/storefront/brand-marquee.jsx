const BRANDS = [
  "Vaporesso",
  "Aspire",
  "Geekvape",
  "Voopoo",
  "Smok",
  "OXVA",
  "Uwell",
  "Cedar Reserve",
  "Brain Freeze",
  "Bar Wars",
  "Hemp Life",
  "Just CBD",
];

/** Continuous brand-name marquee — signals catalogue depth/scale at a glance. */
export function BrandMarquee() {
  const track = [...BRANDS, ...BRANDS];

  return (
    <div className="overflow-hidden border-y border-background/10 bg-foreground py-4">
      <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-10 whitespace-nowrap">
        {track.map((brand, i) => (
          <span
            key={`${brand}-${i}`}
            className="text-sm font-black uppercase tracking-[0.2em] text-background/40"
          >
            {brand}
          </span>
        ))}
      </div>
    </div>
  );
}
