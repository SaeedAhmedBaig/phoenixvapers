import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

/** Formats a value already in pounds (e.g. a user-entered amount). */
export function formatGBP(value) {
  return gbp.format(value ?? 0);
}

/** Formats a value in minor units (pence) as returned by the API. */
export function formatMinor(minor) {
  return gbp.format((minor ?? 0) / 100);
}

/** Category-branded gradient classes, driven by the active theme's primary/accent tokens. */
export function categoryGradient(category) {
  switch (category) {
    case "e-liquids":
      return "from-foreground via-primary to-accent";
    case "hardware":
      return "from-foreground via-secondary-foreground to-primary";
    case "coils":
      return "from-foreground via-primary to-accent/70";
    case "cbd":
      return "from-foreground via-accent to-primary";
    default:
      return "from-foreground via-primary to-accent";
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
