/**
 * Presentation helpers for order status (spec §7.1 state machine).
 *
 * Pure mapping — no I/O — so it is safe in Server or Client Components.
 * The API is the authority on status; this only decides how to name and
 * colour it for shoppers.
 */

const STATUS = {
  created: { label: "Processing", tone: "neutral" },
  payment_authorised: { label: "Payment authorised", tone: "neutral" },
  payment_failed: { label: "Payment failed", tone: "bad" },
  compliance_confirmed: { label: "Confirmed", tone: "good" },
  accepted: { label: "Order confirmed", tone: "good" },
  on_hold: { label: "On hold", tone: "warn" },
  cancelled: { label: "Cancelled", tone: "bad" },
};

export function orderStatusLabel(status) {
  return STATUS[status]?.label ?? status;
}

/** Tailwind classes for a status pill, keyed by tone. */
export function orderStatusClasses(status) {
  const tone = STATUS[status]?.tone ?? "neutral";
  if (tone === "good") return "border-primary/30 bg-primary/5 text-pine";
  if (tone === "bad") return "border-destructive/40 bg-destructive/5 text-destructive";
  if (tone === "warn") return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400";
  return "border-border bg-muted text-muted-foreground";
}
