/**
 * Age-verification provider port (spec §4.2) [COMPLIANCE].
 *
 * The platform integrates a third-party provider for electronic
 * identity/database checks, with document-and-liveness as the
 * escalation path. Everything outside this module sees only this port;
 * swapping providers is an adapter change, never a domain change.
 */

export const AGE_VERIFICATION_PORT = Symbol('AGE_VERIFICATION_PORT');

/** What a provider is given — the minimum, never more (§16.5). */
export interface VerificationSubject {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
}

export interface VerificationCheckResult {
  outcome: 'passed' | 'failed' | 'inconclusive';
  /** Opaque reference into the provider's records — our only evidence copy. */
  evidenceRef: string;
}

/**
 * Thrown when the provider cannot answer at all. The platform MUST fail
 * closed on this — block the sale, alert operations — never fail open.
 */
export class AvProviderUnavailableError extends Error {
  constructor() {
    super('Age-verification provider unavailable');
    this.name = 'AvProviderUnavailableError';
  }
}

export interface AgeVerificationPort {
  /** Electronic identity/database check — instant, first line. */
  checkElectronic(
    subject: VerificationSubject,
  ): Promise<VerificationCheckResult>;

  /** Document + liveness check — the escalation path. */
  checkDocument(subject: VerificationSubject): Promise<VerificationCheckResult>;
}
