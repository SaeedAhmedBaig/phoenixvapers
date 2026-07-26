/**
 * Payment provider port (spec §6.4) — the internal interface every PSP
 * hides behind, so a second provider can be added for resilience without
 * touching order logic.
 *
 * PCI-DSS boundary [COMPLIANCE]: the platform NEVER sees, stores, or
 * transports raw card data. Everything crossing this port is an opaque
 * token minted by the PSP's own capture surface; a PAN cannot even be
 * expressed in these types.
 */

export const PAYMENT_PORT = Symbol('PAYMENT_PORT');

/** Provider unreachable — checkout treats this as fail-closed (§6.3). */
export class PspUnavailableError extends Error {
  constructor() {
    super('Payment provider unavailable');
    this.name = 'PspUnavailableError';
  }
}

export interface AuthoriseRequest {
  /** Duty- and VAT-inclusive order total, integer pence. */
  amountMinor: number;
  /** ISO 4217 — GBP for Edition 1.0. */
  currency: string;
  /** Opaque tokenised payment method from the PSP (card/wallet). */
  paymentMethodToken: string;
  /** Our references, for the PSP dashboard and settlement reconciliation. */
  orderRef: string;
  customerRef: string;
}

export interface PaymentAuthorisation {
  /** PSP's id for this payment intent — our only handle for capture/refund. */
  intentId: string;
  /**
   * 'authorised': funds reserved, SCA satisfied (3-D Secure 2 ran on the
   * PSP side — frictionless or challenge — before the token reached us).
   * 'declined': terminal; the customer must retry with another method.
   */
  status: 'authorised' | 'declined';
  /** Customer-safe reason when declined (never internal detail). */
  declineReason?: string;
}

export interface PaymentProviderPort {
  /** Reserve funds. Capture is a separate step (partial capture, §6.4). */
  authorise(request: AuthoriseRequest): Promise<PaymentAuthorisation>;

  /** Capture some or all of an authorised intent. */
  capture(
    intentId: string,
    amountMinor: number,
  ): Promise<{ captured: boolean }>;

  /** Refund some or all of a captured intent. */
  refund(intentId: string, amountMinor: number): Promise<{ refunded: boolean }>;
}
