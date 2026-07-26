/**
 * Admin console BFF — SERVER-SIDE ONLY.
 *
 * Operators use the SAME session cookies as customers (one login for the
 * whole platform); their JWT simply carries `typ: operator` + a role, which
 * the API enforces on every /admin/* route. So the operator API client is
 * the customer client — the bearer token differs, the transport does not.
 */
import "server-only";

import { redirect } from "next/navigation";

import { AuthRequiredError, customerApi, sessionState } from "@/lib/auth";

/** Call an operator-authenticated endpoint with the session's access token. */
export const operatorApi = customerApi;

/**
 * Gate for every /admin page: resolve the current operator or redirect out.
 * The API is authoritative — a customer token is rejected by the operator
 * strategy exactly as a missing one is, so no unauthorised principal can
 * read past this call. The redirect target is chosen from the (non-security)
 * principal cookie purely for a sensible bounce.
 */
export async function requireOperator() {
  try {
    return await customerApi("/operator/me");
  } catch (error) {
    if (!(error instanceof AuthRequiredError)) throw error;

    const session = await sessionState();
    if (session.principalType === "operator" && session.hasRefresh) {
      // Access token expired — rotate and come back.
      redirect("/auth/refresh?next=/admin");
    }
    if (session.principalType === "customer" && session.hasAccess) {
      // A signed-in shopper is simply not staff.
      redirect("/account");
    }
    redirect("/login?next=/admin");
  }
}

/**
 * Action-level authorisation for the console (spec §D1.3.5) lives in the
 * shared matrix so the UI gates on the SAME source of truth the API enforces.
 * The rule (§25.1): if `can()` is false, do not render the control — an
 * operator never sees a door they cannot open.
 *
 * Import it DIRECTLY from the package, not from here — this module is
 * `server-only`, but `can()` is pure and used from Client Components too
 * (the bulk-action toolbar, contextual buttons):
 *
 *   import { can } from "@phoenix/utils/rbac";
 *   {can(operator, "refund:create", { amountMinor: order.totals.totalMinor }) && (
 *     <RefundButton />
 *   )}
 */

/** Role helpers for conditionally rendering console actions. */
export function isMerchandiser(role) {
  return role === "merchandiser";
}
export function isComplianceOfficer(role) {
  return role === "compliance_officer";
}
export function isPlatformAdmin(role) {
  return role === "platform_admin";
}
