import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { OperatorRole } from '../../common/auth/roles';
import type { AccessJwtPayload } from './jwt.strategy';

/** What operator-guarded handlers receive as `request.user`. */
export interface AuthenticatedOperator {
  operatorId: string;
  email: string;
  role: OperatorRole;
}

/**
 * Operator JWT strategy — the staff counterpart of the customer strategy,
 * on the SAME bearer scheme and secret but a distinct passport name. Only
 * tokens minted with `typ: 'operator'` and a known role validate here, so
 * a customer token is structurally rejected from every admin route.
 */
@Injectable()
export class OperatorJwtStrategy extends PassportStrategy(
  Strategy,
  'operator-jwt',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: AccessJwtPayload): AuthenticatedOperator {
    if (payload.typ !== 'operator') {
      throw new UnauthorizedException('Not an operator session');
    }
    const role = payload.role as OperatorRole;
    if (!Object.values(OperatorRole).includes(role)) {
      throw new UnauthorizedException('Unknown operator role');
    }
    return { operatorId: payload.sub, email: payload.email, role };
  }
}
