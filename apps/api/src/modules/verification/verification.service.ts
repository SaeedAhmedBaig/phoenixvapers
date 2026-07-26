import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuditService } from '../audit/audit.service';
import { AgeVerificationStatus } from '../identity/schemas/customer.schema';
import { CustomersService } from '../identity/customers.service';
import {
  AGE_VERIFICATION_PORT,
  AvProviderUnavailableError,
  type AgeVerificationPort,
  type VerificationCheckResult,
} from './verification.port';

/** Failures before the account soft-locks for human review (§4.2). */
const MAX_FAILED_ATTEMPTS = 3;

/**
 * Age Verification bounded context (spec §4.2) [COMPLIANCE].
 *
 * Owns every verification DECISION; the identity context owns the
 * customer RECORD it lands on. Non-negotiables implemented here:
 *  - fails closed: provider outage blocks progress and raises a P0 alert;
 *  - stores outcome + evidence reference only, never identity documents;
 *  - every decision is written to the immutable audit trail;
 *  - repeated failure soft-locks the account for human review.
 */
@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    @Inject(AGE_VERIFICATION_PORT)
    private readonly provider: AgeVerificationPort,
    private readonly customers: CustomersService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  /** Electronic identity/database check — the first-line verification. */
  async initiate(customerId: string) {
    return this.runCheck(customerId, 'electronic');
  }

  /** Document + liveness — escalation when electronic is inconclusive. */
  async escalate(customerId: string) {
    return this.runCheck(customerId, 'document');
  }

  /** Current verification state for the account UX. */
  async status(customerId: string) {
    return this.statusView(customerId);
  }

  /**
   * The assertion checkout (Phase 3) and subscriptions (Phase 8) call
   * before money moves: valid, unexpired pass or a 403 — no exceptions.
   */
  async assertSaleAllowed(customerId: string): Promise<void> {
    const subject = await this.customers.verificationSubject(customerId);
    const customer = await this.customers.requireById(customerId);
    const av = customer.ageVerification;

    const valid =
      subject.status === AgeVerificationStatus.PASSED &&
      av.expiresAt !== undefined &&
      av.expiresAt > new Date();

    if (!valid) {
      throw new ForbiddenException(
        'A valid age verification is required before purchase',
      );
    }
  }

  /* ─────────────────────────── internals ─────────────────────────── */

  private async runCheck(
    customerId: string,
    method: 'electronic' | 'document',
  ) {
    const subject = await this.customers.verificationSubject(customerId);

    if (subject.status === AgeVerificationStatus.LOCKED) {
      throw new ConflictException(
        'Verification is under review — our team will be in touch',
      );
    }
    if (subject.status === AgeVerificationStatus.PASSED) {
      return this.statusView(customerId);
    }

    let check: VerificationCheckResult;
    try {
      check =
        method === 'electronic'
          ? await this.provider.checkElectronic(subject)
          : await this.provider.checkDocument(subject);
    } catch (error) {
      if (error instanceof AvProviderUnavailableError) {
        // [COMPLIANCE] Fail closed: no verification, no sale — and the
        // outage is a P0 operational event (§4.2, §31).
        this.logger.error(
          `P0: age-verification provider outage (customer ${customerId})`,
        );
        await this.audit.record({
          actor: 'system',
          action: 'verification.provider_outage',
          subjectRef: `customer:${customerId}`,
        });
        throw new ServiceUnavailableException(
          'Verification is temporarily unavailable. Purchases stay paused until it returns — nothing is wrong with your details.',
        );
      }
      throw error;
    }

    await this.applyOutcome(customerId, method, subject.failedAttempts, check);
    return this.statusView(customerId);
  }

  private async applyOutcome(
    customerId: string,
    method: string,
    priorFailures: number,
    check: VerificationCheckResult,
  ): Promise<void> {
    if (check.outcome === 'passed') {
      const ttlDays = this.config.getOrThrow<number>('AV_PASS_TTL_DAYS');
      const verifiedAt = new Date();
      const expiresAt = new Date(
        verifiedAt.getTime() + ttlDays * 24 * 60 * 60 * 1000,
      );

      await this.customers.applyVerificationOutcome(customerId, {
        status: AgeVerificationStatus.PASSED,
        method,
        evidenceRef: check.evidenceRef,
        verifiedAt,
        expiresAt,
      });
    } else if (check.outcome === 'inconclusive') {
      await this.customers.applyVerificationOutcome(customerId, {
        status: AgeVerificationStatus.INCONCLUSIVE,
        method,
        evidenceRef: check.evidenceRef,
      });
    } else {
      const lock = priorFailures + 1 >= MAX_FAILED_ATTEMPTS;
      await this.customers.applyVerificationOutcome(customerId, {
        status: lock
          ? AgeVerificationStatus.LOCKED
          : AgeVerificationStatus.FAILED,
        method,
        evidenceRef: check.evidenceRef,
        countFailure: true,
      });

      if (lock) {
        await this.audit.record({
          actor: 'system',
          action: 'verification.locked',
          subjectRef: `customer:${customerId}`,
          after: { failedAttempts: priorFailures + 1 },
        });
      }
    }

    // [COMPLIANCE] Every decision lands in the immutable trail (§4.6).
    await this.audit.record({
      actor: 'system',
      action: `verification.${check.outcome}`,
      subjectRef: `customer:${customerId}`,
      after: { method, evidenceRef: check.evidenceRef },
    });
  }

  private async statusView(customerId: string) {
    const customer = await this.customers.requireById(customerId);
    const av = customer.ageVerification;
    return {
      status: av.status,
      method: av.method,
      verifiedAt: av.verifiedAt,
      expiresAt: av.expiresAt,
      /** UX hint: inconclusive customers are offered the document path. */
      escalationAvailable: av.status === AgeVerificationStatus.INCONCLUSIVE,
    };
  }

  /* ─────────────────────── operator surface ──────────────────────── */

  /** Compliance Officer unlock after human review — always audited. */
  async unlock(customerId: string, actorId: string) {
    const subject = await this.customers.verificationSubject(customerId);
    if (subject.status !== AgeVerificationStatus.LOCKED) {
      throw new ConflictException('Account is not locked');
    }

    await this.customers.applyVerificationOutcome(customerId, {
      status: AgeVerificationStatus.UNVERIFIED,
    });
    await this.audit.record({
      actor: actorId,
      action: 'verification.unlocked_by_officer',
      subjectRef: `customer:${customerId}`,
    });

    return { unlocked: true };
  }
}
