import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { AuditService } from "../../modules/audit/audit.service";

const MUTATING_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

/**
 * "Every privileged action is observable": records actor, action, before/
 * after payloads, and timestamp for every mutating request, regardless of
 * which module handles it. Structural, not opt-in per controller.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method: string = request.method;

    if (!MUTATING_METHODS.has(method) || request.path?.startsWith("/api/audit")) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: (result) => this.write(request, context, result, 200),
        error: (error) => this.write(request, context, undefined, error?.status ?? 500),
      }),
    );
  }

  private write(request: any, context: ExecutionContext, after: unknown, statusCode: number) {
    const response = context.switchToHttp().getResponse();
    this.auditService
      .record({
        actorId: request.user?.userId,
        actorEmail: request.user?.email,
        method: request.method,
        path: request.originalUrl ?? request.path,
        entityId: request.params?.id,
        after: after && typeof after === "object" ? (after as Record<string, unknown>) : undefined,
        before: request.body && Object.keys(request.body).length ? request.body : undefined,
        statusCode: response?.statusCode ?? statusCode,
        ip: request.ip,
      })
      .catch(() => undefined);
  }
}
