"use client";

import { useAdminAuth } from "../admin/lib/admin-auth";

/**
 * UI-level permission check. The user profile exposes `role` (permissions
 * live in the JWT and are enforced server-side by PermissionsGuard — the UI
 * only decides what to show, never what is allowed).
 */
const ROLE_PERMISSIONS = {
  staff: [
    "catalogue:write",
    "inventory:manage",
    "pricing:manage",
    "orders:manage",
    "reviews:moderate",
    "cms:manage",
    "media:manage",
    "reporting:read",
    "stores:manage",
    "notifications:manage",
  ],
  "brand-partner": ["catalogue:write", "inventory:manage"],
  "super-admin": ["*"],
};

export function usePermission(permission) {
  const { user } = useAdminAuth();
  if (!user?.role) return false;

  const granted = ROLE_PERMISSIONS[user.role] ?? [];
  if (granted.includes("*")) return true;

  const required = Array.isArray(permission) ? permission : [permission];
  return required.every((p) => granted.includes(p));
}
