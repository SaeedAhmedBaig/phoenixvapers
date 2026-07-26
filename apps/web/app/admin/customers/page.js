import { unlockCustomerAction } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { operatorApi } from "@/lib/admin";

export const metadata = { title: "Verification" };

const STATUS_VARIANT = {
  passed: "default",
  unverified: "secondary",
  inconclusive: "secondary",
  failed: "destructive",
  locked: "destructive",
};

const FILTERS = ["", "passed", "unverified", "failed", "inconclusive", "locked"];

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function AdminCustomersPage({ searchParams }) {
  const sp = await searchParams;
  const status = typeof sp?.status === "string" ? sp.status : "";
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const { items = [], counts = {}, total = 0 } = (await operatorApi(`/admin/verification/customers${query}`)) ?? {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-pine text-xs font-semibold tracking-widest uppercase">Compliance</p>
          <h1 className="font-display mt-1 text-2xl font-medium sm:text-3xl">Verification queue</h1>
          <p className="text-muted-foreground mt-2 text-sm">{total} customer account{total === 1 ? "" : "s"} · age verification is enforced server-side before any sale.</p>
        </div>
        <a
          href={`/admin/customers/export${status ? `?status=${status}` : ""}`}
          className="border-input hover:border-primary/50 flex h-9 items-center rounded-none border px-4 text-sm font-medium"
        >
          Export CSV
        </a>
      </div>

      {sp?.error ? <p className="border-destructive/40 bg-destructive/5 text-destructive border px-4 py-2 text-sm" role="alert">{sp.error}</p> : null}
      {sp?.saved ? <p className="border-primary/30 bg-primary/5 text-pine border px-4 py-2 text-sm">Saved.</p> : null}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button key={f || "all"} asChild size="sm" variant={status === f ? "default" : "outline"} className="rounded-none">
            <a href={f ? `/admin/customers?status=${f}` : "/admin/customers"}>
              {f || "All"}{f && counts[f] != null ? ` (${counts[f]})` : ""}
            </a>
          </Button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="border-border bg-card border border-dashed p-10 text-center">
          <p className="text-muted-foreground text-sm">No customer accounts{status ? ` with status "${status}"` : ""} yet.</p>
        </div>
      ) : (
        <ul className="divide-border border-border divide-y border-y text-sm">
          {items.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-muted-foreground text-xs">{c.email} · joined {dateFmt.format(new Date(c.createdAt))}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={STATUS_VARIANT[c.verification.status] ?? "secondary"}>{c.verification.status}</Badge>
                {c.verification.status === "locked" ? (
                  <form action={unlockCustomerAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <Button type="submit" size="sm" variant="outline">Unlock</Button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
