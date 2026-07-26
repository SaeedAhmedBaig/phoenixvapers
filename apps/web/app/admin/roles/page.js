import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, KeyRound, Users } from "lucide-react";
import {
  OPERATOR_ROLES,
  OPERATOR_ROLE_LABELS,
  OPERATOR_ROLE_DESCRIPTIONS,
  PERMISSION_MATRIX,
} from "@phoenix/utils/rbac";

import { operatorApi, requireOperator } from "@/lib/admin";

export const metadata = { title: "Roles" };

const CAN_VIEW = new Set(["platform_admin", "compliance_officer"]);

/** Count operators per role, tolerating a role that can't list operators. */
async function memberCounts() {
  try {
    const { items = [] } = (await operatorApi("/admin/operators")) ?? {};
    return items.reduce((acc, op) => {
      acc[op.role] = (acc[op.role] ?? 0) + 1;
      return acc;
    }, {});
  } catch {
    return null; // compliance officer can view roles but not the operator list
  }
}

export default async function RolesPage() {
  const operator = await requireOperator();
  if (!CAN_VIEW.has(operator.role)) redirect("/admin");

  const members = await memberCounts();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-pine text-xs font-semibold tracking-widest uppercase">Access control</p>
          <h1 className="font-display mt-1 text-2xl font-medium sm:text-3xl">Roles</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
            Seven least-privilege roles (§3.2). Permissions are code-governed and audited — not
            editable here — so a compliance-critical grant can never be widened by accident.
          </p>
        </div>
        <Link
          href="/admin/access"
          className="border-input hover:border-primary/50 inline-flex h-9 items-center gap-1.5 border px-4 text-sm font-medium transition-colors"
        >
          View full matrix <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {OPERATOR_ROLES.map((role) => {
          const count = PERMISSION_MATRIX[role].length;
          const mCount = members?.[role];
          return (
            <Link
              key={role}
              href={`/admin/roles/${role}`}
              className="phx-card group flex flex-col p-5 transition-colors hover:border-primary/50"
            >
              <div className="flex items-start justify-between">
                <span className="bg-accent text-pine inline-flex size-9 items-center justify-center">
                  <KeyRound className="size-4" />
                </span>
                {members ? (
                  <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                    <Users className="size-3.5" /> {mCount ?? 0}
                  </span>
                ) : null}
              </div>
              <h2 className="font-display mt-4 text-lg font-medium">{OPERATOR_ROLE_LABELS[role]}</h2>
              <p className="text-muted-foreground mt-1.5 flex-1 text-sm leading-relaxed">
                {OPERATOR_ROLE_DESCRIPTIONS[role]}
              </p>
              <div className="text-muted-foreground mt-4 flex items-center justify-between text-xs">
                <span className="font-mono">{count} permissions</span>
                <span className="text-pine font-medium group-hover:underline">Open →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
