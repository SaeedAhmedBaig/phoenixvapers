import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import type { AuthenticatedCustomer } from './jwt.strategy';

/**
 * Injects the authenticated customer set by CustomerAuthGuard:
 * `@CurrentCustomer() customer: AuthenticatedCustomer`.
 */
export const CurrentCustomer = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedCustomer => {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedCustomer }>();

    if (!request.user) {
      throw new Error(
        'CurrentCustomer used on a route without CustomerAuthGuard',
      );
    }
    return request.user;
  },
);

/**
 * Optional variant for routes behind OptionalCustomerAuthGuard (the basket,
 * §6.2): returns the customer when signed in, or `null` for a guest —
 * without throwing. Use ONLY on genuinely optional-auth routes; the strict
 * `CurrentCustomer` above stays the default so forgetting a guard on a
 * protected route still fails loudly.
 */
export const CurrentCustomerOptional = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedCustomer | null => {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedCustomer }>();
    return request.user ?? null;
  },
);
