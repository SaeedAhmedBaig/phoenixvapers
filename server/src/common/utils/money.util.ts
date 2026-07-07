/**
 * Money is always stored and computed in minor units (pence) as integers to
 * avoid floating-point drift, and only formatted to pounds at the response
 * boundary.
 */
export function poundsToMinor(pounds: number): number {
  return Math.round(pounds * 100);
}

export function minorToPounds(minor: number): number {
  return Math.round(minor) / 100;
}

export function formatGBP(minor: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(minorToPounds(minor));
}
