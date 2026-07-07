import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import type { AuthUser } from "../types/auth-user.type";

/**
 * Global auth guard. Routes are protected by default (deny by default);
 * mark a route with @Public() to allow anonymous access (e.g. product
 * browsing, guest checkout entry points).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      if (isPublic) return true;
      throw new UnauthorizedException("Missing access token");
    }

    try {
      const payload = await this.jwt.verifyAsync<AuthUser>(token, {
        secret: this.config.get<string>("jwt.accessSecret"),
      });
      request.user = payload;
      return true;
    } catch {
      if (isPublic) return true;
      throw new UnauthorizedException("Invalid or expired access token");
    }
  }

  private extractToken(request: any): string | undefined {
    const header = request.headers?.authorization;
    if (header?.startsWith("Bearer ")) return header.slice(7);
    return undefined;
  }
}
