export function StatsGrid({ stats }) {
  if (!stats?.length) return null;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map(([value, label]) => (
        <article key={`${value}-${label}`} className="rounded-3xl border border-border bg-card/60 p-4">
          <strong className="block text-xl font-black tracking-tight text-foreground sm:text-2xl">{value}</strong>
          <span className="mt-1 block text-xs font-bold text-muted-foreground sm:text-sm">{label}</span>
        </article>
      ))}
    </div>
  );
}
