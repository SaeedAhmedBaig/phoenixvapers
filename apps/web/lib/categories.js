/**
 * Customer-facing category map (spec §5.1 information architecture).
 * Slugs must match the API's CATEGORIES enum exactly.
 */
export const CATEGORIES = [
  {
    slug: "e-liquids",
    label: "E-Liquids",
    blurb: "50/50 and high-VG formats in 10ml and shortfill.",
    shopBy: "By ratio & strength",
  },
  {
    slug: "nic-salts",
    label: "Nic Salts",
    blurb: "TPD-compliant 10ml salts for MTL pod devices.",
    shopBy: "By strength & device",
  },
  {
    slug: "shortfills",
    label: "Shortfills",
    blurb: "0mg large bottles — add your own nic shot.",
    shopBy: "By size & VG/PG",
  },
  {
    slug: "hardware-kits",
    label: "Hardware & Kits",
    blurb: "Pod systems, mods, and starter kits.",
    shopBy: "By device type",
  },
  {
    slug: "coils-consumables",
    label: "Coils & Consumables",
    blurb: "Pods, coils, and replacement parts by device.",
    shopBy: "By compatibility",
  },
  {
    slug: "accessories",
    label: "Accessories",
    blurb: "Bottles, chargers, and everyday essentials.",
    shopBy: "By use",
  },
  {
    slug: "cbd",
    label: "CBD",
    blurb: "CBD e-liquids and related products.",
    shopBy: "By strength",
  },
];

/** PLP category intro copy — Sage voice, factual (spec §5.2). */
export const CATEGORY_INTROS = {
  "e-liquids":
    "UK-made e-liquids in 10ml TPD and shortfill formats. Every batch independently risk-assessed. Prices include duty and VAT.",
  "nic-salts":
    "Nicotine salt e-liquids for MTL pod devices. Smooth delivery at higher strengths. Duty-inclusive, batch-tested.",
  shortfills:
    "Zero-nicotine shortfills in 50ml and 100ml bottles. Add a nic shot to reach your preferred strength.",
  "hardware-kits":
    "Vape kits and devices selected for reliability and compatibility with our e-liquid ranges.",
  "coils-consumables":
    "Replacement coils, pods, and consumables. Filter by device to find an exact match.",
  accessories:
    "Practical accessories for day-to-day vaping — bottles, chargers, and storage.",
  cbd: "CBD e-liquids from a compliance-first UK supplier. Full specification on every product page.",
};

export function categoryLabel(slug) {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export function categoryIntro(slug) {
  return CATEGORY_INTROS[slug] ?? null;
}

export function categoryMeta(slug) {
  return CATEGORIES.find((c) => c.slug === slug) ?? null;
}
