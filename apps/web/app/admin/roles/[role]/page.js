import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  OPERATOR_ROLES,
  OPERATOR_ROLE_LABELS,
  OPERATOR_ROLE_DESCRIPTIONS,
  PERMISSION_MATRIX,
  ROLE_LIMITS,
  SEGREGATION_RULES,
} from "@phoenix/utils/rbac";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPence } from "@phoenix/utils/money";
import { operatorApi, requireOperator } from "@/lib/admin";

const CAN_VIEW = new Set(["platform_admin", "compliance_officer"]);
const SEG_APPROVE = new Set(SEGREGATION_RULES.map((r) => r.approve));

export async function generateMetadata({ params }) {
  const { role } = await params;
  return { title: OPERATOR_ROLE_LABELS[role] ?? "Role" };
}

/** Operators holding this role, tolerating a viewer who can't list them. */
async function membersFor(role) {
  try {
    const { items = [] } = (await operatorApi("/admin/operators")) ?? {};
    return items.filter((op) => op.role === role);
  } catch {
    return null;
  }
}

function prettyResource(resource) {
  return resource.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Group a role's permissions by resource for a readable breakdown. */
function groupByResource(permissions) {
  const groups = new Map();
  for (const permission of [...permissions].sort()) {
    const [resource, action] = permission.split(":");
    if (!groups.has(resource)) groups.set(resource, []);
    groups.get(resource).push({ permission, action });
  }
  return groups;
}

export default async function RoleDetailPage({ params }) {
  const operator = await requireOperator();
  if (!CAN_VIEW.has(operator.role)) redirect("/admin");

  const { role } = await params;
  // Unknown role → back to the list (fail closed, no guessing).
  if (!OPERATOR_ROLES.includes(role)) redirect("/admin/roles");

  const permissions = PERMISSION_MATRIX[role];
  const groups = groupByResource(permissions);
  const limits = ROLE_LIMITS[role];
  const members = await membersFor(role);
  const relatedSeg = SEGREGATION_RULES.filter(
    (r) => permissions.includes(r.approve) || permissions.includes(r.create),
  );

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/roles" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm">
          <ArrowLeft className="size-4" /> Roles
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-medium sm:text-3xl">{OPERATOR_ROLE_LABELS[role]}</h1>
          <Badge variant="secondary" className="font-mono">{role}</Badge>
        </div>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">{OPERATOR_ROLE_DESCRIPTIONS[role]}</p>
      </div>

      {/* Stat row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Permissions" value={permissions.length} />
        <Stat label="Operators" value={members ? members.length : "—"} />
        <Stat
          label="Refund ceiling"
          value={limits ? (limits.refundCeilingMinor == null ? "Unlimited" : formatPence(limits.refundCeilingMinor)) : "None"}
        />
      </div>

      {/* Permissions by resource */}
      <Card className="rounded-none shadow-sm">
        <CardHeader><CardTitle className="text-lg">Permissions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {[...groups.entries()].map(([resource, actions]) => (
              <div key={resource}>
                <p className="text-pine text-[11px] font-semibold tracking-wider uppercase">{prettyResource(resource)}</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {actions.map(({ permission, action }) => (
                    <li
                      key={permission}
                      className="border-border bg-muted/40 inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-xs"
                    >
                      {action}
                      {SEG_APPROVE.has(permission) ? (
                        <span className="text-warning" title="Segregation of duties — cannot approve your own artefact">▲</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Segregation rules touching this role */}
      {relatedSeg.length ? (
        <Card className="rounded-none shadow-sm">
          <CardHeader><CardTitle className="text-lg">Segregation of duties</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              [COMPLIANCE §3.2] The create and approve steps below must be performed by
              different operators. The console hides the Approve control from an artefact&apos;s author.
            </p>
            <ul className="divide-border border-border divide-y border-y text-sm">
              {relatedSeg.map((rule) => (
                <li key={`${rule.create}->${rule.approve}`} className="flex flex-wrap items-center gap-2 py-2.5">
                  <code className="bg-muted rounded-none px-1.5 py-0.5 font-mono text-xs">{rule.create}</code>
                  <span className="text-muted-foreground" aria-hidden>→</span>
                  <code className="bg-muted rounded-none px-1.5 py-0.5 font-mono text-xs">{rule.approve}</code>
                  {rule.requireSecond ? <span className="text-warning ml-1 text-xs font-medium">· needs a second approver</span> : null}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {/* Members */}
      {members ? (
        <Card className="rounded-none shadow-sm">
          <CardHeader><CardTitle className="text-lg">Operators with this role ({members.length})</CardTitle></CardHeader>
          <CardContent>
            {members.length ? (
              <ul className="divide-border border-border divide-y border-y text-sm">
                {members.map((op) => (
                  <li key={op.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                    <div>
                      <p className="font-medium">{op.firstName} {op.lastName}</p>
                      <p className="text-muted-foreground text-xs">{op.email}</p>
                    </div>
                    <Badge variant={op.status === "active" ? "default" : "destructive"}>{op.status}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No operators currently hold this role.</p>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="phx-card p-5">
      <p className="text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
      <p className="font-display mt-1 text-2xl font-medium tabular-nums">{value}</p>
    </div>
  );
}
