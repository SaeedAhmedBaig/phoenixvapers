import { redirect } from "next/navigation";
import { SEGREGATION_RULES } from "@phoenix/utils/rbac";

import { PermissionMatrix } from "@/components/admin/permission-matrix";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOperator } from "@/lib/admin";

export const metadata = { title: "Roles & permissions" };

/** Who may inspect the access model: the platform admin who runs it, and the
 *  compliance officer who owns segregation of duties (§3.2). */
const CAN_VIEW = new Set(["platform_admin", "compliance_officer"]);

export default async function AccessPage() {
  const operator = await requireOperator();
  // Direct-URL guard — nav already hides this, but pages fail closed too.
  if (!CAN_VIEW.has(operator.role)) redirect("/admin");

  return (
    <div className="space-y-8">
      <div>
        <p className="text-pine text-xs font-semibold tracking-widest uppercase">Access control</p>
        <h1 className="font-display mt-1 text-2xl font-medium sm:text-3xl">Roles &amp; permissions</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
          What each operator role may do, rendered from the single permission matrix the
          API enforces — so the console never offers an action the backend would refuse.
        </p>
      </div>

      {/* Legend */}
      <div className="text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
        <span className="flex items-center gap-1.5"><span className="text-pine font-semibold">●</span> granted</span>
        <span className="flex items-center gap-1.5"><span className="text-muted-foreground/40">–</span> not granted</span>
        <span className="flex items-center gap-1.5"><span className="text-warning">▲</span> segregation of duties — cannot approve your own artefact</span>
      </div>

      <PermissionMatrix />

      <Card className="rounded-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Segregation of duties</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 text-sm">
            [COMPLIANCE §3.2] For each pair below, the operator who performs the create step
            must not be the one who performs the approve step on the same artefact. Enforced
            server-side; the console hides the Approve control from an artefact&apos;s author.
          </p>
          <ul className="divide-border border-border divide-y border-y text-sm">
            {SEGREGATION_RULES.map((rule) => (
              <li key={`${rule.create}->${rule.approve}`} className="flex flex-wrap items-center gap-2 py-2.5">
                <code className="bg-muted rounded-none px-1.5 py-0.5 font-mono text-xs">{rule.create}</code>
                <span className="text-muted-foreground" aria-hidden>→</span>
                <code className="bg-muted rounded-none px-1.5 py-0.5 font-mono text-xs">{rule.approve}</code>
                {rule.requireSecond ? (
                  <span className="text-warning ml-1 text-xs font-medium">· needs a second approver</span>
                ) : null}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
