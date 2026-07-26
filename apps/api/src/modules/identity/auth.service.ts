import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'node:crypto';
import { Model } from 'mongoose';

import { OperatorRole } from '../../common/auth/roles';
import { AuditService } from '../audit/audit.service';
import { RegisterDto } from './dto/identity.dto';
import { OperatorsService } from './operators.service';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { OperatorDocument } from './schemas/operator.schema';
import { RefreshToken } from './schemas/refresh-token.schema';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  /** Seconds until the access token expires — for client scheduling. */
  expiresIn: number;
}

/** Who signed in — the storefront routes on this (customer → account,
 *  operator → admin). */
export type LoginResult =
  | { principalType: 'customer'; customer: CustomerDocument; tokens: TokenPair }
  | { principalType: 'operator'; operator: OperatorDocument; tokens: TokenPair };

/** The subject a token is minted for. */
interface Principal {
  id: string;
  email: string;
  type: 'customer' | 'operator';
  role?: OperatorRole;
}

/**
 * Customer authentication (spec §6.1/§16.4): argon2id at rest, short
 * JWT access tokens, rotating refresh tokens with reuse detection.
 *
 * Enumeration hygiene: login always performs one argon2 verification —
 * against a decoy hash when the email is unknown — and returns one
 * generic message, so response content and timing do not reveal whether
 * an address is registered.
 */
@Injectable()
export class AuthService {
  /** Decoy hash for unknown emails — computed once at boot. */
  private decoyHashPromise = argon2.hash('decoy-password-for-timing', {
    type: argon2.argon2id,
  });

  constructor(
    @InjectModel(Customer.name) private readonly customers: Model<Customer>,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokens: Model<RefreshToken>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
    private readonly operators: OperatorsService,
  ) {}

  async register(
    dto: RegisterDto,
  ): Promise<{ customer: Customer; tokens: TokenPair }> {
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    let created;
    try {
      created = await this.customers.create({
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        dateOfBirth: dto.dateOfBirth,
      });
    } catch (error: unknown) {
      // Unique-index race on email — same outward behaviour as a lookup.
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException('That email address is already registered');
      }
      throw error;
    }

    await this.audit.record({
      actor: `customer:${created.id}`,
      action: 'identity.customer.registered',
      subjectRef: `customer:${created.id}`,
      after: { email: dto.email },
    });

    return {
      customer: created,
      tokens: await this.issueTokens({
        id: created.id as string,
        email: created.email,
        type: 'customer',
      }),
    };
  }

  /**
   * Unified sign-in for the whole platform (spec §16.3). Operators and
   * customers share one endpoint but never one identity space: staff are
   * resolved from the operators collection FIRST (there are few of them and
   * they know their accounts exist), then customers with the usual
   * enumeration-hygiene decoy verify. The token's `typ`/`role` — not the
   * caller — decides what the session can reach.
   */
  async login(email: string, password: string): Promise<LoginResult> {
    const operator = await this.operators.findByEmail(email);
    if (operator) {
      const valid = await argon2
        .verify(operator.passwordHash, password)
        .catch(() => false);
      if (!valid) {
        throw new UnauthorizedException('Invalid email or password');
      }
      if (operator.status !== 'active') {
        throw new UnauthorizedException(
          'This staff account is suspended — contact a platform admin',
        );
      }
      return {
        principalType: 'operator',
        operator,
        tokens: await this.issueTokens({
          id: operator.id as string,
          email: operator.email,
          type: 'operator',
          role: operator.role,
        }),
      };
    }

    const customer = await this.customers.findOne({ email });
    const hash = customer?.passwordHash ?? (await this.decoyHashPromise);
    const valid = await argon2.verify(hash, password).catch(() => false);

    if (!customer || !valid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (customer.status === 'locked') {
      throw new UnauthorizedException(
        'This account is locked — contact support',
      );
    }

    return {
      principalType: 'customer',
      customer,
      tokens: await this.issueTokens({
        id: customer.id as string,
        email: customer.email,
        type: 'customer',
      }),
    };
  }

  /**
   * Rotate a refresh token. Reuse of an already-revoked token is treated
   * as theft: every session for that customer is revoked immediately.
   */
  async rotate(presented: string): Promise<TokenPair> {
    const tokenHash = sha256(presented);
    const record = await this.refreshTokens.findOne({ tokenHash });

    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired — sign in again');
    }

    if (record.revokedAt) {
      // Theft indicator — revoke every live session for this principal.
      await this.refreshTokens.updateMany(
        {
          customerId: record.customerId,
          principalType: record.principalType,
          revokedAt: null,
        },
        { $set: { revokedAt: new Date() } },
      );
      await this.audit.record({
        actor: `${record.principalType}:${record.customerId}`,
        action: 'identity.session.reuse_detected',
        subjectRef: `${record.principalType}:${record.customerId}`,
      });
      throw new UnauthorizedException('Session expired — sign in again');
    }

    const principal = await this.resolvePrincipal(
      record.principalType,
      String(record.customerId),
    );
    if (!principal) {
      throw new UnauthorizedException('Session expired — sign in again');
    }

    const tokens = await this.issueTokens(principal);
    record.revokedAt = new Date();
    record.replacedByHash = sha256(tokens.refreshToken);
    await record.save();

    return tokens;
  }

  /**
   * Load the still-valid principal behind a refresh token, or null if it
   * has since been locked/suspended/deleted (fail closed on rotation).
   */
  private async resolvePrincipal(
    principalType: string,
    id: string,
  ): Promise<Principal | null> {
    if (principalType === 'operator') {
      const operator = await this.operators
        .requireById(id)
        .catch(() => null);
      if (!operator || operator.status !== 'active') return null;
      return {
        id: operator.id as string,
        email: operator.email,
        type: 'operator',
        role: operator.role,
      };
    }

    const customer = await this.customers.findById(id);
    if (!customer || customer.status === 'locked') return null;
    return {
      id: customer.id as string,
      email: customer.email,
      type: 'customer',
    };
  }

  async logout(presented: string): Promise<void> {
    await this.refreshTokens.updateOne(
      { tokenHash: sha256(presented) },
      { $set: { revokedAt: new Date() } },
    );
  }

  /* ────────────────────────── internals ──────────────────────────── */

  private async issueTokens(principal: Principal): Promise<TokenPair> {
    const expiresIn = this.config.getOrThrow<number>('JWT_ACCESS_TTL_SECONDS');

    const accessToken = await this.jwt.signAsync(
      {
        sub: principal.id,
        email: principal.email,
        typ: principal.type,
        ...(principal.role ? { role: principal.role } : {}),
      },
      { expiresIn },
    );

    const refreshToken = randomBytes(48).toString('hex');
    const ttlDays = this.config.getOrThrow<number>('REFRESH_TTL_DAYS');
    await this.refreshTokens.create({
      customerId: principal.id,
      principalType: principal.type,
      tokenHash: sha256(refreshToken),
      expiresAt: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000),
    });

    return { accessToken, refreshToken, expiresIn };
  }
}

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}
