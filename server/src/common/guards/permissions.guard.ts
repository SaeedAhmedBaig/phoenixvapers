import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import type { AuthUser } from "../types/auth-user.type";

/**
 * Enforces the permission(s) declared via @Permissions() server-side.
 * The client is untrusted: this guard is the sole source of authorisation
 * truth, never the UI's decision to show/hide a control.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user: AuthUser | undefined = request.user;

    if (!user) throw new ForbiddenException("Authentication required");

    const granted = new Set(user.permissions ?? []);
    const allowed = granted.has("*") || required.every((permission) => granted.has(permission));

    if (!allowed) {
      throw new ForbiddenException(`Missing required permission: ${required.join(", ")}`);
    }
    return true;
  }
}
