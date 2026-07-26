import {
  OPERATOR_ROLES,
  OPERATOR_ROLE_LABELS,
  PERMISSION_MATRIX,
  SEGREGATION_RULES,
} from "@phoenix/utils/rbac";

/**
 * Roles & permissions matrix (spec §3.2, Dev Edition Vol 2 §D1.3.2) — the
 * super-admin's read-only view of exactly what each operator role may do.
 * Rendered straight from the shared PERMISSION_MATRIX so it can never drift
 * from what the API actually enforces.
 *
 * `▲` marks segregation-of-duties permissions: holding one does NOT let the
 * same operator approve an artefact they authored (enforced server-side).
 */

const SEG_APPROVE = new Set(SEGREGATION_RULES.map((r) => r.approve));

/** Group every granted permission by its resource, preserving a stable order. */
function buildResourceGroups() {
  const all = new Set();
  for (const perms of Object.values(PERMISSION_MATRIX)) {
    for (const p of perms) all.add(p);
  }
  const groups = new Map();
  for (const permission of [...all].sort()) {
    const [resource] = permission.split(":");
    if (!groups.has(resource)) groups.set(resource, []);
    groups.get(resource).push(permission);
  }
  return groups;
}

function prettyResource(resource) {
  return resource.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function PermissionMatrix() {
  const groups = buildResourceGroups();

  return (
    <div className="border-border overflow-x-auto border">
      {/* min-width forces horizontal scroll on small screens rather than
          crushing 7 role columns; the permission column stays pinned. */}
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-border bg-muted/50 border-b">
            <th className="bg-muted/50 text-muted-foreground sticky left-0 z-10 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">
              Permission
            </th>
            {OPERATOR_ROLES.map((role) => (
              <th
                key={role}
                className="text-muted-foreground min-w-[92px] px-2 py-2.5 text-center text-[11px] font-semibold leading-tight"
              >
                {OPERATOR_ROLE_LABELS[role]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...groups.entries()].map(([resource, permissions]) => (
            <ResourceGroup key={resource} resource={resource} permissions={permissions} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResourceGroup({ resource, permissions }) {
  return (
    <>
      <tr className="phx-section-sunken border-border border-b">
        <th
          colSpan={OPERATOR_ROLES.length + 1}
          className="phx-section-sunken text-pine sticky left-0 px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider"
        >
          {prettyResource(resource)}
        </th>
      </tr>
      {permissions.map((permission) => {
        const action = permission.split(":")[1];
        const isSeg = SEG_APPROVE.has(permission);
        return (
          <tr key={permission} className="border-border hover:bg-muted/30 border-b">
            <td className="bg-card sticky left-0 px-3 py-2 font-mono text-xs whitespace-nowrap">
              {action}
              {isSeg ? (
                <span
                  className="text-warning ml-1"
                  title="Segregation of duties — cannot approve your own artefact (§3.2)"
                  aria-label="segregation of duties"
                >
                  ▲
                </span>
              ) : null}
            </td>
            {OPERATOR_ROLES.map((role) => {
              const has = PERMISSION_MATRIX[role].includes(permission);
              return (
                <td key={role} className="px-2 py-2 text-center">
                  {has ? (
                    <span className="text-pine font-semibold" aria-label="granted">
                      ●
                    </span>
                  ) : (
                    <span className="text-muted-foreground/30" aria-label="not granted">
                      –
                    </span>
                  )}
                </td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}
