"use client";

import { useAdminAuth } from "../admin/lib/admin-auth";

export function usePermission(permission: string | string[]): boolean {
  const { user } = useAdminAuth();

  if (!user?.permissions || !Array.isArray(user.permissions)) {
    return false;
  }

  const permissions = Array.isArray(permission) ? permission : [permission];
  return permissions.some((p) => user.permissions.includes(p));
}

export function useRequirePermission(
  permission: string | string[],
  fallback?: React.ReactNode,
) {
  const hasPermission = usePermission(permission);
  return { hasPermission, fallback };
}
