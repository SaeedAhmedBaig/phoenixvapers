import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { Model } from 'mongoose';

import { OperatorRole } from '../../common/auth/roles';
import { AuditService } from '../audit/audit.service';
import { Operator, OperatorDocument } from './schemas/operator.schema';

export interface CreateOperatorInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: OperatorRole;
}

export interface UpdateOperatorInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: OperatorRole;
}

/**
 * Operator accounts (spec §3.2). The ONLY exported surface for the
 * operators collection — no other module touches it directly (§16.7).
 * Creation is privileged: callers must already be a platform admin (or the
 * bootstrap CLI); this service never exposes a public self-signup path.
 */
@Injectable()
export class OperatorsService {
  constructor(
    @InjectModel(Operator.name)
    private readonly operators: Model<Operator>,
    private readonly audit: AuditService,
  ) {}

  findByEmail(email: string): Promise<OperatorDocument | null> {
    return this.operators.findOne({ email: email.toLowerCase().trim() });
  }

  async requireById(id: string): Promise<OperatorDocument> {
    const operator = await this.operators.findById(id);
    if (!operator) throw new NotFoundException('Operator not found');
    return operator;
  }

  /** All staff accounts, newest first — the platform-admin console list. */
  list(): Promise<OperatorDocument[]> {
    return this.operators.find().sort({ createdAt: -1 });
  }

  /** Flip a staff account between active and suspended (access revocation). */
  async setStatus(
    id: string,
    status: 'active' | 'suspended',
    actor: string,
  ): Promise<OperatorDocument> {
    const operator = await this.requireById(id);
    operator.status = status;
    await operator.save();
    await this.audit.record({
      actor,
      action: 'identity.operator.status_changed',
      subjectRef: `operator:${operator.id}`,
      after: { status },
    });
    return operator;
  }

  async count(): Promise<number> {
    return this.operators.countDocuments();
  }

  /**
   * Provision a staff account. `actor` attributes the creation in the audit
   * trail — a platform admin's id, or `bootstrap` for the first account.
   */
  async create(
    input: CreateOperatorInput,
    actor: string,
  ): Promise<OperatorDocument> {
    const passwordHash = await argon2.hash(input.password, {
      type: argon2.argon2id,
    });

    let created: OperatorDocument;
    try {
      created = await this.operators.create({
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role,
      });
    } catch (error: unknown) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException('That email address already has an account');
      }
      throw error;
    }

    await this.audit.record({
      actor,
      action: 'identity.operator.created',
      subjectRef: `operator:${created.id}`,
      after: { email: created.email, role: created.role },
    });

    return created;
  }

  /**
   * Edit an existing staff account's identity/role — platform-admin only
   * (enforced by the controller guard, not here). A role change is a
   * security-relevant event, so it's captured in the same before/after
   * audit record as name/email edits, not a silent field update.
   */
  async update(
    id: string,
    input: UpdateOperatorInput,
    actor: string,
  ): Promise<OperatorDocument> {
    const operator = await this.requireById(id);
    const before = {
      firstName: operator.firstName,
      lastName: operator.lastName,
      email: operator.email,
      role: operator.role,
    };

    if (input.firstName !== undefined) operator.firstName = input.firstName;
    if (input.lastName !== undefined) operator.lastName = input.lastName;
    if (input.email !== undefined) operator.email = input.email;
    if (input.role !== undefined) operator.role = input.role;

    try {
      await operator.save();
    } catch (error: unknown) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException('That email address already has an account');
      }
      throw error;
    }

    await this.audit.record({
      actor,
      action: 'identity.operator.updated',
      subjectRef: `operator:${operator.id}`,
      before,
      after: {
        firstName: operator.firstName,
        lastName: operator.lastName,
        email: operator.email,
        role: operator.role,
      },
    });

    return operator;
  }

  /**
   * Reset a staff account's password — platform-admin only. The new
   * password is never logged; the audit trail records only that a reset
   * happened and when, matching the "never echo submitted values" rule
   * already applied to validation errors (§16.10).
   */
  async resetPassword(
    id: string,
    newPassword: string,
    actor: string,
  ): Promise<void> {
    const operator = await this.requireById(id);
    operator.passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
    });
    await operator.save();

    await this.audit.record({
      actor,
      action: 'identity.operator.password_reset',
      subjectRef: `operator:${operator.id}`,
      after: { resetAt: new Date().toISOString() },
    });
  }
}
