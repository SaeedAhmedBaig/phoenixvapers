import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import { Operator } from './roles';

/**
 * Injects the authenticated operator (set by OperatorAuthGuard) into a
 * handler parameter: `@CurrentOperator() operator: Operator`.
 */
export const CurrentOperator = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Operator => {
    const request = context
      .switchToHttp()
      .getRequest<Request & { operator?: Operator }>();

    if (!request.operator) {
      // Guard misconfiguration is a programming error — surface loudly.
      throw new Error(
        'CurrentOperator used on a route without OperatorAuthGuard',
      );
    }

    return request.operator;
  },
);
