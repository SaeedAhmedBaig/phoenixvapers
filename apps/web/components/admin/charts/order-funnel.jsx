"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

/**
 * Order funnel (§28.4) — a horizontal bar of order counts by lifecycle state,
 * with the exact count printed at the end of every bar (§28.1: figures legible
 * without interaction). Failure states render in the destructive token so the
 * eye lands on them; chart height flexes to the number of states.
 *
 * @param {{ data: Array<{ label: string, count: number, tone?: 'default'|'bad' }> }} props
 */
export function OrderFunnel({ data = [] }) {
  const height = Math.max(180, data.length * 42);

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 8 }}>
          <XAxis type="number" hide domain={[0, "dataMax"]} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="label"
            width={150}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
          />
          <Tooltip
            cursor={{ fill: "var(--color-muted)" }}
            contentStyle={{
              background: "var(--color-popover)",
              border: "1px solid var(--color-border)",
              borderRadius: 0,
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--color-foreground)" }}
          />
          <Bar dataKey="count" barSize={20} isAnimationActive={false}>
            <LabelList dataKey="count" position="right" className="fill-foreground text-xs tabular-nums" />
            {data.map((d, i) => (
              <Cell key={i} fill={d.tone === "bad" ? "var(--color-destructive)" : "var(--color-primary)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
