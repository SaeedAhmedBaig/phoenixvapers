import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard for routes that serve BOTH signed-in customers and guests (the
 * basket, §6.2). A valid bearer token attaches the customer to the
 * request; an absent or invalid one attaches nothing — it NEVER 401s.
 *
 * Fail-open here is deliberate and safe: identity is only used to select
 * WHICH cart is read, and everything money- or compliance-relevant
 * (checkout) sits behind the strict CustomerAuthGuard instead.
 */
@Injectable()
export class OptionalCustomerAuthGuard extends AuthGuard('customer-jwt') {
  handleRequest<TUser = unknown>(_err: unknown, user: TUser): TUser | null {
    return user ?? null;
  }
}
