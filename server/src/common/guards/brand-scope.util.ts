import { ForbiddenException } from "@nestjs/common";
import { ROLE_NAMES } from "../constants/permissions";
import type { AuthUser } from "../types/auth-user.type";

/**
 * Structural cross-brand isolation: a brand-partner user may only act on
 * entities within their own brandScope. Super admins and staff are exempt.
 * This must be called from every service method a brand-partner can reach —
 * UI-level hiding alone is explicitly insufficient per the platform's RBAC
 * principle.
 */
export function assertBrandScope(user: AuthUser, brandId: string | undefined | null): void {
  if (user.role !== ROLE_NAMES.BRAND_PARTNER) return;
  if (!brandId || !user.brandScope.includes(brandId)) {
    throw new ForbiddenException("This brand is outside your account's scope");
  }
}
