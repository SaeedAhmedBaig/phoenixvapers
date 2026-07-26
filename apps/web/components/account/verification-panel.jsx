import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";

import {
  escalateVerificationAction,
  initiateVerificationAction,
} from "@/app/(account)/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_LABEL = {
  unverified: "Not verified",
  passed: "Verified",
  failed: "Could not verify",
  inconclusive: "Needs a second check",
  locked: "Under review",
};

const STATUS_COPY = {
  unverified:
    "A quick electronic check confirms your date of birth against UK records. We never store identity documents unless you choose the ID upload path.",
  passed:
    "You are verified for checkout. Your pass renews automatically before it expires.",
  failed:
    "We could not confirm your age on this attempt. You can try again — repeated failures may require a brief manual review.",
  inconclusive:
    "The electronic check could not reach a clear result. You can upload a photo ID as a second step — still handled securely, with no documents kept on our servers.",
  locked:
    "Your account needs a brief manual review after several unsuccessful attempts. Our team will be in touch, or you can contact support.",
};

/** Customer-facing age verification block — calm care, not an obstacle (spec §4.2). */
export function VerificationPanel({ verification, compact = false }) {
  const status = verification?.status ?? "unverified";
  const label = STATUS_LABEL[status] ?? status;

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {!compact ? (
        <div className="flex gap-4 border border-border/80 bg-card p-5">
          <div className="bg-accent flex size-12 shrink-0 items-center justify-center">
            <ShieldCheck className="text-pine size-6" />
          </div>
          <div>
            <p className="text-pine text-xs font-semibold tracking-widest uppercase">Age verification</p>
            <h2 className="font-display mt-1 text-xl font-medium">Confirm you are 18 or over</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              UK law requires age assurance before your first order. This is a one-time check — responsible care, not a hurdle.
            </p>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Status</span>
          <Badge variant={status === "passed" ? "default" : "secondary"}>{label}</Badge>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">{STATUS_COPY[status] ?? STATUS_COPY.unverified}</p>
        {verification?.expiresAt ? (
          <p className="text-muted-foreground text-xs">
            Valid until {new Date(verification.expiresAt).toLocaleDateString("en-GB")}
          </p>
        ) : null}
      </div>

      {status === "passed" ? (
        <div className="text-pine flex items-center gap-2 text-sm">
          <CheckCircle2 className="size-4 shrink-0" />
          You&apos;re verified and ready to check out.
        </div>
      ) : null}

      {status === "unverified" || status === "failed" ? (
        <form action={initiateVerificationAction}>
          <Button type="submit">{status === "failed" ? "Try again" : "Start verification"}</Button>
        </form>
      ) : null}

      {verification?.escalationAvailable ? (
        <form action={escalateVerificationAction}>
          <Button type="submit" variant="outline">Upload ID (secure escalation)</Button>
        </form>
      ) : null}

      {status === "locked" ? (
        <p className="text-muted-foreground text-sm">
          Email <a href="mailto:support@phoenixvapers.co.uk" className="text-pine hover:underline">support@phoenixvapers.co.uk</a> if you need help.
        </p>
      ) : null}

      {!compact && status === "passed" ? (
        <Button asChild variant="outline">
          <Link href="/c/e-liquids">Continue shopping</Link>
        </Button>
      ) : null}
    </div>
  );
}
