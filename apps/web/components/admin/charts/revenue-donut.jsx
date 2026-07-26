"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatPence } from "@phoenix/utils/money";

/**
 * Revenue composition donut (§28.3) — how gross taken splits into net, vaping
 * duty and VAT. Colours are token-driven and every slice is also labelled with
 * its exact £ value and share beside the chart (never colour alone, §28.1), so
 * the figures are legible without hovering.
 */
const SERIES = [
  { key: "net", name: "Net revenue", color: "var(--color-primary)" },
  { key: "duty", name: "Vaping duty", color: "var(--color-info)" },
  { key: "vat", name: "VAT", color: "var(--color-warning)" },
];

function Tip({ active, payload, total }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const pct = total > 0 ? ((p.value / total) * 100).toFixed(1) : "0.0";
  return (
    <div className="border-border bg-popover px-3 py-2 text-xs shadow-sm">
      <p className="font-medium">{p.name}</p>
      <p className="tabular-nums">{formatPence(p.value)} · {pct}%</p>
    </div>
  );
}

export function RevenueDonut({ netMinor = 0, dutyMinor = 0, vatMinor = 0 }) {
  const values = { net: netMinor, duty: dutyMinor, vat: vatMinor };
  const data = SERIES.map((s) => ({ ...s, value: Math.max(0, values[s.key]) }));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="grid items-center gap-6 sm:grid-cols-2">
      <div className="relative mx-auto h-56 w-full max-w-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={total > 0 ? data : [{ name: "No data", value: 1, color: "var(--color-muted)" }]}
              dataKey="value"
              nameKey="name"
              innerRadius="64%"
              outerRadius="92%"
              paddingAngle={total > 0 ? 1.5 : 0}
              strokeWidth={0}
              isAnimationActive={false}
            >
              {(total > 0 ? data : [{ color: "var(--color-muted)" }]).map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            {total > 0 ? <Tooltip content={<Tip total={total} />} /> : null}
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-muted-foreground text-[11px] uppercase tracking-wide">Gross taken</span>
          <span className="font-display text-xl font-medium tabular-nums">{formatPence(total)}</span>
        </div>
      </div>

      {/* Exact-value legend — figures visible without interaction. */}
      <dl className="space-y-2.5">
        {data.map((d) => {
          const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : "0.0";
          return (
            <div key={d.key} className="flex items-center gap-2.5">
              <span className="size-2.5 shrink-0" style={{ background: d.color }} aria-hidden />
              <dt className="text-muted-foreground min-w-[92px] text-sm">{d.name}</dt>
              <dd className="ml-auto text-sm font-medium tabular-nums">{formatPence(d.value)}</dd>
              <dd className="text-muted-foreground w-12 text-right text-xs tabular-nums">{pct}%</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
