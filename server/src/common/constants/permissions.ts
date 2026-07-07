/**
 * Deny-by-default permission strings. Every mutating route must declare the
 * permission(s) it requires via @Permissions(); PermissionsGuard rejects
 * anything not explicitly granted to the caller's role.
 */
export const PERMISSIONS = {
  CATALOGUE_WRITE: "catalogue:write",
  INVENTORY_MANAGE: "inventory:manage",
  PRICING_MANAGE: "pricing:manage",
  ORDERS_MANAGE: "orders:manage",
  REVIEWS_MODERATE: "reviews:moderate",
  COMPLIANCE_MANAGE: "compliance:manage",
  CMS_MANAGE: "cms:manage",
  MEDIA_MANAGE: "media:manage",
  REPORTING_READ: "reporting:read",
  SETTINGS_MANAGE: "settings:manage",
  AUDIT_READ: "audit:read",
  RBAC_MANAGE: "rbac:manage",
  STORES_MANAGE: "stores:manage",
  INTEGRATIONS_MANAGE: "integrations:manage",
  NOTIFICATIONS_MANAGE: "notifications:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_NAMES = {
  CUSTOMER: "customer",
  STAFF: "staff",
  BRAND_PARTNER: "brand-partner",
  SUPER_ADMIN: "super-admin",
} as const;

export type RoleName = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES];

/** Seeded default role -> permission set. Super admin holds "*" (all). */
export const DEFAULT_ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  [ROLE_NAMES.CUSTOMER]: [],
  [ROLE_NAMES.STAFF]: [
    PERMISSIONS.CATALOGUE_WRITE,
    PERMISSIONS.INVENTORY_MANAGE,
    PERMISSIONS.PRICING_MANAGE,
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.REVIEWS_MODERATE,
    PERMISSIONS.CMS_MANAGE,
    PERMISSIONS.MEDIA_MANAGE,
    PERMISSIONS.REPORTING_READ,
    PERMISSIONS.STORES_MANAGE,
    PERMISSIONS.NOTIFICATIONS_MANAGE,
  ],
  [ROLE_NAMES.BRAND_PARTNER]: [PERMISSIONS.CATALOGUE_WRITE, PERMISSIONS.INVENTORY_MANAGE],
  [ROLE_NAMES.SUPER_ADMIN]: ["*"],
};
