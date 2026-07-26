import { SetMetadata } from '@nestjs/common';

import { OperatorRole } from './roles';

export const ROLES_KEY = 'phoenix:required-roles';

/**
 * Declares which operator roles may call a handler, enforced by
 * OperatorAuthGuard. A handler with no @RequireRoles cannot be reached
 * through the guard at all — routes are closed by default.
 */
export const RequireRoles = (...roles: OperatorRole[]) =>
  SetMetadata(ROLES_KEY, roles);
