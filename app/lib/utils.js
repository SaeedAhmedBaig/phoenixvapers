import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export function formatGBP(value) {
  return gbp.format(value ?? 0);
}

/** Deterministic gradient identity per category so cards feel branded without image assets. */
export function categoryGradient(category) {
  switch (category) {
    case "e-liquids":
      return "from-[#0b2a1c] via-[#0ca252] to-[#aecc53]";
    case "hardware":
      return "from-[#161b1c] via-[#2c3132] to-[#0ca252]";
    case "coils":
      return "from-[#12312a] via-[#0ca252] to-[#7db8a0]";
    case "cbd":
      return "from-[#1a2913] via-[#5c8a2c] to-[#aecc53]";
    default:
      return "from-[#0b2a1c] via-[#0ca252] to-[#aecc53]";
  }
}

/** Split the human strength string ("3mg / 6mg / 12mg") into selectable options. */
export function strengthOptions(strength) {
  if (!strength) return [];
  return strength
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const FREE_SHIPPING_THRESHOLD = 30;
export const DELIVERY_FEE = 3.99;
export const POINTS_PER_POUND = 1;
