/**
 * Money helpers.
 *
 * Platform rule (spec §18): money is ALWAYS stored and computed in minor
 * units (integer pence) — never floats. These helpers are the only place
 * conversion to/from display strings should happen.
 */

/** Default currency for Edition 1.0 — UK-only (spec §2.2). */
export const DEFAULT_CURRENCY = "GBP";

/**
 * Convert a decimal pounds value (e.g. user input "12.99") to integer pence.
 * Throws on values that cannot be represented exactly.
 *
 * @param {string|number} pounds - Decimal pounds, e.g. "12.99" or 12.99
 * @returns {number} Integer pence, e.g. 1299
 */
export function toPence(pounds) {
  const value = typeof pounds === "string" ? pounds.trim() : String(pounds);

  if (!/^-?\d+(\.\d{1,2})?$/.test(value)) {
    throw new RangeError(`Not a valid money amount: "${pounds}"`);
  }

  const [whole, fraction = ""] = value.split(".");
  const sign = whole.startsWith("-") ? -1 : 1;
  const pence =
    Math.abs(Number(whole)) * 100 + Number(fraction.padEnd(2, "0"));

  return sign * pence;
}

/**
 * Format integer pence as a localised currency string.
 *
 * @param {number} pence - Integer minor units, e.g. 1299
 * @param {string} [currency] - ISO 4217 code, defaults to GBP
 * @returns {string} e.g. "£12.99"
 */
export function formatPence(pence, currency = DEFAULT_CURRENCY) {
  if (!Number.isInteger(pence)) {
    throw new RangeError(`Money must be integer minor units, got: ${pence}`);
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(pence / 100);
}
