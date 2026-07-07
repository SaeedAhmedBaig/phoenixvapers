export function StatCard({ icon: Icon, label, value, trend, trendUp }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-muted-foreground">{label}</p>
          <strong className="mt-2 block text-3xl font-black tracking-tight text-foreground">{value}</strong>
          <span className={`mt-2 inline-flex text-sm font-bold ${trendUp ? "text-success" : "text-destructive"}`}>
            {trend}
          </span>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}
