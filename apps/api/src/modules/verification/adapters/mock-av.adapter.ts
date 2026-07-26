import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';

import {
  AgeVerificationPort,
  AvProviderUnavailableError,
  VerificationCheckResult,
  VerificationSubject,
} from '../verification.port';

/**
 * Deterministic sandbox provider (spec §16.11: external providers run in
 * mock mode locally, including fault injection so the fail-closed paths
 * can be exercised deliberately).
 *
 * Behaviour contract (used by QA and the compliance test suite):
 *  - AV_FAULT_MODE=outage        -> provider unavailable (fails closed)
 *  - subject under 18            -> failed (both check types)
 *  - last name contains "inconclusive" -> electronic check inconclusive
 *  - last name contains "faildoc"      -> document check failed
 *  - otherwise                   -> passed
 */
@Injectable()
export class MockAvAdapter implements AgeVerificationPort {
  constructor(private readonly config: ConfigService) {}

  // Async so every failure mode — including outage — is a rejection,
  // exactly as a real network-backed adapter would behave.
  async checkElectronic(
    subject: VerificationSubject,
  ): Promise<VerificationCheckResult> {
    this.maybeOutage();

    if (!isAdult(subject.dateOfBirth)) return result('failed');
    if (subject.lastName.toLowerCase().includes('inconclusive')) {
      return result('inconclusive');
    }
    return result('passed');
  }

  async checkDocument(
    subject: VerificationSubject,
  ): Promise<VerificationCheckResult> {
    this.maybeOutage();

    if (!isAdult(subject.dateOfBirth)) return result('failed');
    if (subject.lastName.toLowerCase().includes('faildoc')) {
      return result('failed');
    }
    return result('passed');
  }

  private maybeOutage(): void {
    if (this.config.get<string>('AV_FAULT_MODE') === 'outage') {
      throw new AvProviderUnavailableError();
    }
  }
}

function isAdult(dateOfBirth: Date): boolean {
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
  return dateOfBirth <= eighteenYearsAgo;
}

function result(
  outcome: VerificationCheckResult['outcome'],
): VerificationCheckResult {
  return { outcome, evidenceRef: `mock-av:${randomUUID()}` };
}
