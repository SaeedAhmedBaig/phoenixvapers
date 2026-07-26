import { SetMetadata } from '@nestjs/common';
import type { Permission } from '@phoenix/utils/rbac';

export const PERMISSIONS_KEY = 'phoenix:required-permissions';

/**
 * Declares the `resource:action` permissions a handler requires, enforced by
 * OperatorAuthGuard against the shared PERMISSION_MATRIX (@phoenix/utils/rbac,
 * spec §D1.3). The operator's role must hold EVERY listed permission.
 *
 * Finer-grained than @RequireRoles: a route says what it DOES ("order:hold")
 * rather than who may call it, so the matrix — not scattered role lists — is
 * the single place authorisation is decided. A route may carry both decorators;
 * both must pass. A route with neither is closed by default (the guard rejects
 * it), preserving the fail-closed posture.
 */
export const RequirePermission = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
