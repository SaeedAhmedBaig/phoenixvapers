import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

import { roleHasPermission } from '@phoenix/utils/rbac';
import type { Permission } from '@phoenix/utils/rbac';

import { ROLES_KEY } from '../../common/auth/roles.decorator';
import { PERMISSIONS_KEY } from '../../common/auth/permissions.decorator';
import { Operator, OperatorRole } from '../../common/auth/roles';
import type { AuthenticatedOperator } from './operator-jwt.strategy';

/**
 * Operator authentication + authorisation for admin routes — the JWT
 * successor to AdminTokenGuard (spec §16.3, replacing the interim tokens).
 *
 * Security properties preserved from the token guard:
 *  - Fails closed: an invalid/absent/customer token is 401 (passport).
 *  - Closed by default: a route with no @RequireRoles is rejected even
 *    with a valid operator token.
 *  - Wrong role is 403, and `request.operator` still carries the actor for
 *    audit attribution — the same shape the old guard set, so controllers
 *    using @CurrentOperator keep working unchanged.
 */
@Injectable()
export class OperatorAuthGuard extends AuthGuard('operator-jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Runs the operator-jwt strategy → sets request.user or throws 401.
    const authenticated = (await super.canActivate(context)) as boolean;
    if (!authenticated) return false;

    const requiredRoles = this.reflector.getAllAndOverride<
      OperatorRole[] | undefined
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);

    const requiredPermissions = this.reflector.getAllAndOverride<
      Permission[] | undefined
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    const hasRolePolicy = !!requiredRoles && requiredRoles.length > 0;
    const hasPermissionPolicy =
      !!requiredPermissions && requiredPermissions.length > 0;

    // Closed by default — an admin route must declare a role and/or a
    // permission policy. A route with neither is unreachable (§D1.3, fail-closed).
    if (!hasRolePolicy && !hasPermissionPolicy) {
      throw new ForbiddenException('Route has no authorisation policy');
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user: AuthenticatedOperator; operator?: Operator }>();
    const { role, operatorId } = request.user;

    // Coarse role gate (where a route still declares roles).
    if (hasRolePolicy && !requiredRoles.includes(role)) {
      throw new ForbiddenException('Insufficient role for this action');
    }

    // Permission gate against the shared matrix — the operator's role must
    // hold EVERY required permission. The coarse role check here is
    // context-free (amount/authorship gates live in the handler, which calls
    // `can()` for refunds and segregation-of-duties before mutating).
    if (
      hasPermissionPolicy &&
      !requiredPermissions.every((permission) =>
        roleHasPermission(role, permission),
      )
    ) {
      throw new ForbiddenException('Insufficient permission for this action');
    }

    // Attach the audit-attribution shape the old guard used.
    request.operator = { role, actorId: `operator:${operatorId}` };
    return true;
  }
}
