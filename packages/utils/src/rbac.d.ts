/**
 * Types for @phoenix/utils/rbac — so the TypeScript API gets full checking on
 * compliance-critical authorisation code while the runtime loads the JS.
 * Kept in lockstep with rbac.js (Developer Edition Vol 2 §D1.3).
 */

export type OperatorRole =
  | "merchandiser"
  | "compliance_officer"
  | "customer_support"
  | "finance"
  | "fulfilment"
  | "marketing"
  | "platform_admin";

export type Action =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "approve"
  | "export"
  | "hold"
  | "release"
  | "refund"
  | "impersonate";

export type Resource =
  | "order"
  | "customer"
  | "product"
  | "compliance_profile"
  | "inventory"
  | "label_order"
  | "serial"
  | "price"
  | "promotion"
  | "refund"
  | "settlement"
  | "campaign"
  | "newsletter"
  | "content"
  | "operator"
  | "role"
  | "feature_flag"
  | "config"
  | "audit";

/** A `resource:action` grant. Kept as a broad string for forward-compatibility. */
export type Permission = `${Resource}:${Action}` | string;

export interface RoleLimits {
  /** null = unlimited; below this a refund escalates to finance. */
  refundCeilingMinor: number | null;
}

export interface SegregationRule {
  create: Permission;
  approve: Permission;
  requireSecond?: boolean;
}

export interface Actor {
  role: OperatorRole;
  /** Front-end identity. */
  id?: string;
  /** API audit-attribution identity (e.g. "operator:<id>"). */
  actorId?: string;
}

export interface CanContext {
  amountMinor?: number;
  createdByActorId?: string;
}

export const OPERATOR_ROLES: OperatorRole[];
export const OPERATOR_ROLE_LABELS: Record<OperatorRole, string>;
export const OPERATOR_ROLE_DESCRIPTIONS: Record<OperatorRole, string>;
export const PERMISSION_MATRIX: Record<OperatorRole, Permission[]>;
export const ROLE_LIMITS: Partial<Record<OperatorRole, RoleLimits>>;
export const SEGREGATION_RULES: SegregationRule[];

export function permissionsForRole(role: OperatorRole): Permission[];
export function roleHasPermission(role: OperatorRole, permission: Permission): boolean;
export function can(actor: Actor, permission: Permission, ctx?: CanContext): boolean;
