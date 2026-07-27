import Link from "next/link";
import { Check } from "lucide-react";
import { OPERATOR_ROLE_LABELS } from "@phoenix/utils/rbac";

/**
 * Shared view of where a product actually stands in its lifecycle — visible
 * to EVERY operator who can open the page, not split across the role-gated
 * cards below it. This is the fix for the console's biggest usability gap:
 * a merchandiser and a compliance officer each only saw their own half of
 * the process before, with no shared "what's next / whose turn" signal.
 *
 * The state machine itself is unchanged (draft → review → sellable →
 * retired, spec §7.1/§16.7) — this only visualises it. Retired is rendered
 * as a separate terminal branch, not a 5th step on the linear track.
 */

const STEPS = ["Draft", "Submitted for review", "Compliance approved", "Sellable"];

/**
 * Pure — no side effects, exported for testability.
 * @param {{ status: string, complianceLocked: boolean }} args
 * @returns {{ stepIndex: number, nextAction: string|null, nextRole: "merchandiser"|"compliance_officer"|null }}
 */
export function deriveNextAction({ status, complianceLocked }) {
  if (status === "draft") {
    return { stepIndex: 0, nextAction: "Submit for review", nextRole: "merchandiser" };
  }
  if (status === "review" && !complianceLocked) {
    return { stepIndex: 1, nextAction: "Set the compliance profile and approve", nextRole: "compliance_officer" };
  }
  if (status === "review" && complianceLocked) {
    return { stepIndex: 2, nextAction: "Publish", nextRole: "merchandiser" };
  }
  if (status === "sellable") {
    return { stepIndex: 3, nextAction: null, nextRole: null };
  }
  // retired — terminal, not on the linear track
  return { stepIndex: -1, nextAction: null, nextRole: null };
}

export function LifecycleStepper({ status, complianceLocked, operatorRole, roleDetailHref }) {
  if (status === "retired") {
    return (
      <div className="phx-card flex items-center gap-3 p-4">
        <span className="text-muted-foreground border-border inline-flex size-8 shrink-0 items-center justify-center border text-xs font-semibold uppercase">
          ⏹
        </span>
        <div>
          <p className="font-medium">Retired</p>
          <p className="text-muted-foreground text-sm">No longer sellable. Commerce data is frozen.</p>
        </div>
      </div>
    );
  }

  const { stepIndex, nextAction, nextRole } = deriveNextAction({ status, complianceLocked });
  const isBlockedForViewer = nextRole && nextRole !== operatorRole;

  return (
    <div className="space-y-4">
      <ol className="flex flex-wrap items-stretch gap-2">
        {STEPS.map((label, i) => {
          const done = i < stepIndex;
          const current = i === stepIndex;
          return (
            <li
              key={label}
              className={
                "flex min-w-[7.5rem] flex-1 items-center gap-2 border p-3 text-sm " +
                (current
                  ? "border-l-2 border-primary bg-accent"
                  : done
                    ? "border-border bg-card"
                    : "border-border bg-muted/30")
              }
            >
              <span
                className={
                  "flex size-5 shrink-0 items-center justify-center text-[11px] font-semibold " +
                  (done ? "bg-primary text-primary-foreground" : current ? "text-pine" : "text-muted-foreground")
                }
              >
                {done ? <Check className="size-3" /> : i + 1}
              </span>
              <span className={current ? "text-pine font-medium" : done ? "font-medium" : "text-muted-foreground"}>
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      {nextAction ? (
        <p className={"text-sm " + (isBlockedForViewer ? "text-warning" : "text-muted-foreground")}>
          {isBlockedForViewer ? "▲ " : null}
          <span className="font-medium">Next: {nextAction}</span> — needed from{" "}
          <span className="font-medium">{OPERATOR_ROLE_LABELS[nextRole]}</span>
          {isBlockedForViewer ? (
            <>
              . Segregation of duties (§3.2): your role can&apos;t take this step.{" "}
              {roleDetailHref ? (
                <Link href={roleDetailHref} className="underline hover:no-underline">
                  See what your role can do
                </Link>
              ) : null}
            </>
          ) : (
            "."
          )}
        </p>
      ) : (
        <p className="text-muted-foreground text-sm">Nothing pending — this product is live on the storefront.</p>
      )}
    </div>
  );
}
