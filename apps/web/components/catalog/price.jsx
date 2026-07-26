import { formatPence } from "@phoenix/utils/money";

export function Price({ breakdown, prefix, className = "" }) {
  if (!breakdown) return <span className={`text-muted-foreground text-sm ${className}`}>Price TBA</span>;
  return (
    <span className={`inline-flex items-baseline gap-1 ${className}`}>
      {prefix ? <span className="text-muted-foreground text-xs">{prefix}</span> : null}
      <span className="font-semibold tabular-nums">{formatPence(breakdown.totalMinor)}</span>
    </span>
  );
}

export function PriceBreakdown({ breakdown }) {
  if (!breakdown) return null;
  const rows = [["Product", breakdown.netMinor], ["Duty", breakdown.dutyMinor], ["VAT", breakdown.vatMinor]];
  return (
    <details className="text-sm">
      <summary className="text-pine cursor-pointer font-medium">Price breakdown</summary>
      <dl className="border-border mt-2 space-y-1 rounded-none border p-3">
        {rows.map(([l, m]) => (
          <div key={l} className="flex justify-between gap-4"><dt className="text-muted-foreground">{l}</dt><dd className="font-mono text-xs">{formatPence(m)}</dd></div>
        ))}
        <div className="border-border flex justify-between border-t pt-1 font-medium">
          <dt>Total</dt><dd className="font-mono">{formatPence(breakdown.totalMinor)}</dd>
        </div>
      </dl>
    </details>
  );
}
