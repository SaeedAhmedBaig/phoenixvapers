import { Card, CardContent } from "@/components/ui/card";

/**
 * A single headline number — the "3-5 key metrics read first" hierarchy
 * principle (§28) applied consistently across the console. Extracted from
 * the Reports page (which had its own local `Kpi`) so the Home dashboard
 * can use the exact same visual language rather than a second card style.
 */
export function KpiCard({ label, value }) {
  return (
    <Card className="rounded-none shadow-sm">
      <CardContent className="py-5">
        <p className="text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
        <p className="font-display mt-1 text-2xl font-medium tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
