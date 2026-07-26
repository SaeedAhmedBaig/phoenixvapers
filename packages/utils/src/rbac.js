/**
 * @phoenix/utils/rbac — the single source of truth for operator authorisation
 * (spec §3.2, Developer Edition Vol 2 §D1.3).
 *
 * "Shared before duplicated" (§16.6): the permission matrix lives here once
 * and is consumed by BOTH the TypeScript API (which ENFORCES it in the
 * OperatorAuthGuard) and the JSX front-ends (which use `can()` to decide
 * whether to RENDER an action). The API is always the authority — the UI
 * hiding a button is a courtesy, never the security boundary (§25.1).
 *
 * Plain JS + a companion rbac.d.ts so the API gets real types and the
 * front-ends consume it natively.
 */

/**
 * The seven operator roles (spec §3.2). String values match the API's
 * `OperatorRole` enum and the front-end role strings exactly, so this one
 * table serves every consumer without translation.
 */
export const OPERATOR_ROLES = [
  "merchandiser",
  "compliance_officer",
  "customer_support",
  "finance",
  "fulfilment",
  "marketing",
  "platform_admin",
];

/**
 * Display labels — one source of truth so the admin shell, staff console and
 * permission matrix stop each keeping their own copy.
 */
export const OPERATOR_ROLE_LABELS = {
  merchandiser: "Merchandiser",
  compliance_officer: "Compliance Officer",
  customer_support: "Customer Support",
  finance: "Finance",
  fulfilment: "Fulfilment",
  marketing: "Marketing",
  platform_admin: "Platform Admin",
};

/**
 * One-line role charters (§3.2) — shown on the Roles console so an admin can
 * see intent, not just a permission list.
 */
export const OPERATOR_ROLE_DESCRIPTIONS = {
  merchandiser: "Curates the catalogue, pricing and promotions — cannot touch compliance flags.",
  compliance_officer: "Guards the licence — approves listings and artwork, owns compliance profiles.",
  customer_support: "Front line — reads orders and customers, holds/releases, refunds within a limit.",
  finance: "Money and reporting — settlements, refunds approval, revenue/tax reports.",
  fulfilment: "Warehouse — picking, packing, dispatch, inventory and serials.",
  marketing: "Promotions, content and newsletters — sends gated by compliance approval.",
  platform_admin: "Runs the platform — operators, roles, config, flags; cannot silently alter audit.",
};

/**
 * Permission matrix: role → the `resource:action` tuples it may perform.
 *
 * This is what the UI offers and the API allows. Two principles from §3.2
 * are visible in the shape below:
 *  - Least privilege: each role holds only what its job needs.
 *  - [COMPLIANCE] Segregation of duties (see SEGREGATION_RULES): a role may
 *    hold `*:approve` WITHOUT being able to approve an artefact it authored.
 *    e.g. compliance_officer approves compliance profiles but cannot create
 *    products; platform_admin deliberately holds NEITHER compliance nor
 *    settlement approval — admin is not a compliance override.
 */
export const PERMISSION_MATRIX = {
  merchandiser: [
    "product:create",
    "product:read",
    "product:update",
    "compliance_profile:read", // can SEE the profile, never approve it
    "price:read",
    "price:update",
    "promotion:create",
    "promotion:read",
    "promotion:update",
    "content:create",
    "content:read",
    "content:update",
    "order:read",
    "customer:read",
    "inventory:read",
  ],
  compliance_officer: [
    "compliance_profile:read",
    "compliance_profile:approve", // ▲ approves, never creates the product
    "product:read",
    "label_order:read",
    "label_order:approve", // ▲ artwork approval (§26.4)
    "serial:read",
    "order:read",
    "order:hold", // may hold for review, may NOT dispatch
    "customer:read",
    "audit:read",
    "audit:export",
    "config:read",
  ],
  customer_support: [
    "customer:read",
    "customer:update",
    "customer:impersonate", // read-only, audited (§25.2)
    "order:read",
    "order:hold",
    "order:release",
    "refund:create", // bounded by ROLE_LIMITS.refundCeilingMinor
  ],
  finance: [
    "order:read",
    "order:export",
    "settlement:read",
    "settlement:approve", // ▲ force-match reconciliation (§D3.3)
    "settlement:export",
    "refund:read",
    "refund:approve", // ▲ approves refunds above the CS ceiling
    "price:read",
    "config:read",
    "audit:read",
  ],
  fulfilment: [
    "order:read",
    "order:release",
    "inventory:read",
    "inventory:update",
    "label_order:read",
    "serial:read",
    "serial:update", // print/verify/apply transitions (§26.5)
  ],
  marketing: [
    "campaign:create",
    "campaign:read",
    "campaign:update",
    "newsletter:create",
    "newsletter:read", // sending requires compliance approval ▲
    "content:read",
    "customer:read", // segments only — sensitive fields are masked by the serializer
  ],
  platform_admin: [
    "operator:create",
    "operator:read",
    "operator:update",
    "operator:delete",
    "role:read",
    "role:update",
    "feature_flag:read",
    "feature_flag:update",
    "config:read",
    "config:update",
    "audit:read",
    "audit:export",
    // Operational oversight: an admin runs the platform, so holds broad READ
    // and the order hold/release controls it already operates today. This is
    // NOT a compliance override — note the deliberate exclusions below.
    "order:read",
    "order:hold",
    "order:release",
    "customer:read",
    "product:read",
    "inventory:read",
    // NB: no compliance_profile:approve, no settlement:approve, no
    // refund:approve — segregation of duties is never waived for admins (§3.2).
  ],
};

/**
 * Value-bounded permissions (§D1.3.3). Some grants are limited by an amount,
 * not a boolean: a customer_support refund above the ceiling escalates to
 * finance rather than proceeding. `null` means unlimited.
 */
export const ROLE_LIMITS = {
  customer_support: { refundCeilingMinor: 5000 }, // £50.00
  finance: { refundCeilingMinor: null },
};

/**
 * [COMPLIANCE] Segregation-of-duties pairs (§3.2, §D1.3.4). The operator who
 * performs `create` MUST NOT be the one who performs the paired `approve` on
 * the SAME artefact. Enforced server-side (409 SEGREGATION_CONFLICT) and
 * mirrored in the UI by hiding the Approve control from the artefact's author.
 * `requireSecond` marks controls that additionally need a second approver.
 */
export const SEGREGATION_RULES = [
  { create: "product:create", approve: "compliance_profile:approve" },
  { create: "label_order:create", approve: "label_order:approve" },
  { create: "refund:create", approve: "refund:approve" },
  { create: "settlement:read", approve: "settlement:approve" },
  { create: "config:update", approve: "config:update", requireSecond: true },
];

/**
 * Every permission a role holds (ignoring context). Cheap membership source
 * for nav filtering and the API guard.
 *
 * @param {string} role
 * @returns {string[]}
 */
export function permissionsForRole(role) {
  return PERMISSION_MATRIX[role] ?? [];
}

/**
 * Context-free check: does this role hold the permission at all? Use this in
 * the API guard (role is trusted, no artefact context needed for the coarse
 * gate); use `can()` where amount/authorship context applies.
 *
 * @param {string} role
 * @param {string} permission
 * @returns {boolean}
 */
export function roleHasPermission(role, permission) {
  return permissionsForRole(role).includes(permission);
}

/**
 * The authorisation primitive (§D1.3.5). True only when the actor's role
 * holds the permission AND every contextual gate passes:
 *  - value ceilings (refunds above a role's limit fail here → escalate);
 *  - segregation of duties (you cannot approve your own artefact).
 *
 * UI rule: when this returns false the control is NOT rendered (§25.1) —
 * an operator never sees a door they cannot open. Disabled-with-reason is
 * reserved for [COMPLIANCE] blockers the operator should understand (§D6).
 *
 * @param {{ role: string, id?: string, actorId?: string }} actor
 * @param {string} permission                       resource:action
 * @param {{ amountMinor?: number, createdByActorId?: string }} [ctx]
 * @returns {boolean}
 */
export function can(actor, permission, ctx = {}) {
  if (!actor || !roleHasPermission(actor.role, permission)) return false;

  // Value ceiling — e.g. a refund above the role's limit is not permitted here
  // (the UI routes it to "Escalate to finance"; the API returns REFUND_CEILING).
  if (permission === "refund:create") {
    const limit = ROLE_LIMITS[actor.role]?.refundCeilingMinor;
    if (limit != null && (ctx.amountMinor ?? 0) > limit) return false;
  }

  // [COMPLIANCE] Segregation of duties — the author of an artefact may not be
  // the approver of it. `actor.id` and `actor.actorId` are both accepted so
  // the front-end (id) and the API's audit shape (actorId) share this code.
  const rule = SEGREGATION_RULES.find((r) => r.approve === permission);
  if (rule && ctx.createdByActorId) {
    const actorIdentity = actor.id ?? actor.actorId;
    if (actorIdentity && actorIdentity === ctx.createdByActorId) return false;
  }

  return true;
}
