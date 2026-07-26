import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * Access-token payload. `typ` distinguishes the principal so a customer
 * token can never reach an operator route and vice versa. Legacy tokens
 * (before operators existed) carry no `typ` and are treated as customers.
 */
export interface AccessJwtPayload {
  sub: string;
  email: string;
  typ?: 'customer' | 'operator';
  /** Present only on operator tokens. */
  role?: string;
}

/** What customer-guarded handlers receive as `request.user`. */
export interface AuthenticatedCustomer {
  customerId: string;
  email: string;
}

/**
 * Customer JWT strategy — bearer tokens, HS256, strict expiry.
 * Verification status is NOT trusted from the token (it can change after
 * issue); anything compliance-relevant re-reads the customer record.
 *
 * Operator tokens are rejected here: sharing one login endpoint must never
 * let a staff token act as a customer (or reach `/me`, checkout, etc.).
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'customer-jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: AccessJwtPayload): AuthenticatedCustomer {
    if (payload.typ === 'operator') {
      throw new UnauthorizedException('Not a customer session');
    }
    return { customerId: payload.sub, email: payload.email };
  }
}
