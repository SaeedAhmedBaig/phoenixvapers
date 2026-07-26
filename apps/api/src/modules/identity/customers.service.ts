import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AuditService } from '../audit/audit.service';
import { AddressDto, ConsentsDto, UpdateProfileDto } from './dto/identity.dto';
import { Customer, CustomerDocument } from './schemas/customer.schema';

/**
 * Customer profile operations, and the narrow read interface other
 * modules (verification, later checkout) consume. Serialisation to the
 * public shape happens in the controller layer — this service returns
 * documents for module-internal use only.
 */
@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private readonly model: Model<Customer>,
    private readonly audit: AuditService,
  ) {}

  async requireById(id: string): Promise<CustomerDocument> {
    const customer = await this.model.findById(id);
    if (!customer) throw new NotFoundException('Account not found');
    return customer;
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const customer = await this.requireById(id);
    if (dto.firstName !== undefined) customer.firstName = dto.firstName;
    if (dto.lastName !== undefined) customer.lastName = dto.lastName;
    await customer.save();
    return customer;
  }

  async addAddress(id: string, dto: AddressDto) {
    const customer = await this.requireById(id);
    customer.addresses.push(dto);
    await customer.save();
    return customer;
  }

  async removeAddress(id: string, index: number) {
    const customer = await this.requireById(id);
    if (index < 0 || index >= customer.addresses.length) {
      throw new NotFoundException('Address not found');
    }
    customer.addresses.splice(index, 1);
    await customer.save();
    return customer;
  }

  /* ── Interface consumed by the Age Verification context ─────────── */

  /**
   * The minimum the verification provider needs about a customer
   * (data minimisation, §16.5) plus current verification state.
   */
  async verificationSubject(id: string) {
    const c = await this.requireById(id);
    return {
      id: String(c._id),
      firstName: c.firstName,
      lastName: c.lastName,
      dateOfBirth: c.dateOfBirth,
      status: c.ageVerification.status,
      failedAttempts: c.ageVerification.failedAttempts,
    };
  }

  /**
   * Apply a verification decision to the customer record. The DECISION
   * belongs to the verification context; the RECORD belongs here. Only
   * outcome, method, evidence reference and expiry are stored — never
   * raw identity data (§4.2).
   */
  async applyVerificationOutcome(
    id: string,
    outcome: {
      status: string;
      method?: string;
      evidenceRef?: string;
      verifiedAt?: Date;
      expiresAt?: Date;
      countFailure?: boolean;
    },
  ) {
    const customer = await this.requireById(id);
    const av = customer.ageVerification;

    av.status = outcome.status as typeof av.status;
    if (outcome.method) av.method = outcome.method;
    if (outcome.evidenceRef) av.evidenceRef = outcome.evidenceRef;
    av.verifiedAt = outcome.verifiedAt;
    av.expiresAt = outcome.expiresAt;
    av.failedAttempts = outcome.countFailure ? av.failedAttempts + 1 : 0;

    await customer.save();
    return customer;
  }

  /** Operator listing for the console verification queues. */
  async adminList(params: { status?: string; page: number; pageSize: number }) {
    const filter: Record<string, unknown> = {};
    if (params.status) filter['ageVerification.status'] = params.status;

    const [items, total, countRows] = await Promise.all([
      this.model
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip((params.page - 1) * params.pageSize)
        .limit(params.pageSize)
        .lean(),
      this.model.countDocuments(filter),
      this.model.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$ageVerification.status', count: { $sum: 1 } } },
      ]),
    ]);

    const counts: Record<string, number> = { all: 0 };
    for (const row of countRows) {
      counts[row._id] = row.count;
      counts.all += row.count;
    }

    return { items, total, counts };
  }

  /**
   * Nightly sweep: passes past their expiry drop back to `unverified`,
   * so an expired pass can never satisfy the checkout assertion. Returns
   * how many accounts were expired (for the job log + audit).
   */
  async expireVerificationPasses(now: Date): Promise<number> {
    const result = await this.model.updateMany(
      {
        'ageVerification.status': 'passed',
        'ageVerification.expiresAt': { $lt: now },
      },
      {
        $set: {
          'ageVerification.status': 'unverified',
          'ageVerification.expiresAt': undefined,
        },
      },
    );
    return result.modifiedCount;
  }

  /**
   * Consent changes are audited with a timestamp — the lawful, auditable
   * opt-in of §4.5 is a record, not a boolean.
   */
  async updateConsents(id: string, dto: ConsentsDto) {
    const customer = await this.requireById(id);
    const before = { marketingEmail: customer.consents.marketingEmail };

    customer.consents.marketingEmail = dto.marketingEmail;
    customer.consents.marketingEmailAt = new Date();
    await customer.save();

    await this.audit.record({
      actor: `customer:${id}`,
      action: 'identity.consents.updated',
      subjectRef: `customer:${id}`,
      before,
      after: { marketingEmail: dto.marketingEmail },
    });

    return customer;
  }
}
