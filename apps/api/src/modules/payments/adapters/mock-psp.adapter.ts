import { randomUUID } from 'node:crypto';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  PspUnavailableError,
  type AuthoriseRequest,
  type PaymentAuthorisation,
  type PaymentProviderPort,
} from '../payments.port';

/**
 * Mock PSP (spec §16.11 — test doubles are part of the platform).
 *
 * Deterministic by payment-method token so every checkout path can be
 * exercised on demand, mirroring how real PSPs ship test tokens:
 *
 *   pm_card_ok            → authorised (3-DS2 frictionless)
 *   pm_card_3ds_ok        → authorised (3-DS2 challenge, passed)
 *   pm_card_declined      → declined (generic)
 *   pm_card_insufficient  → declined (insufficient funds)
 *
 * PSP_FAULT_MODE=outage makes every call throw, so checkout's fail-closed
 * behaviour can be exercised deliberately, like AV_FAULT_MODE does for
 * age verification.
 */
@Injectable()
export class MockPspAdapter implements PaymentProviderPort {
  private readonly logger = new Logger(MockPspAdapter.name);

  /** Authorised intents and their remaining capturable amount. */
  private readonly intents = new Map<
    string,
    { authorisedMinor: number; capturedMinor: number }
  >();

  constructor(private readonly config: ConfigService) {}

  // Methods are async so a fault-mode failure is always a REJECTION —
  // exactly how a network failure from a real PSP SDK presents.
  async authorise(request: AuthoriseRequest): Promise<PaymentAuthorisation> {
    await this.assertAvailable();

    if (request.paymentMethodToken === 'pm_card_declined') {
      return {
        intentId: `mockpay_${randomUUID()}`,
        status: 'declined',
        declineReason: 'Your card was declined',
      };
    }
    if (request.paymentMethodToken === 'pm_card_insufficient') {
      return {
        intentId: `mockpay_${randomUUID()}`,
        status: 'declined',
        declineReason: 'Insufficient funds',
      };
    }

    const intentId = `mockpay_${randomUUID()}`;
    this.intents.set(intentId, {
      authorisedMinor: request.amountMinor,
      capturedMinor: 0,
    });
    this.logger.log(
      `Authorised ${request.amountMinor}p for ${request.orderRef} (${intentId})`,
    );
    return { intentId, status: 'authorised' };
  }

  async capture(
    intentId: string,
    amountMinor: number,
  ): Promise<{ captured: boolean }> {
    await this.assertAvailable();

    const intent = this.intents.get(intentId);
    if (
      !intent ||
      intent.capturedMinor + amountMinor > intent.authorisedMinor
    ) {
      return { captured: false };
    }
    intent.capturedMinor += amountMinor;
    return { captured: true };
  }

  async refund(
    intentId: string,
    amountMinor: number,
  ): Promise<{ refunded: boolean }> {
    await this.assertAvailable();

    const intent = this.intents.get(intentId);
    if (!intent || amountMinor > intent.capturedMinor) {
      return { refunded: false };
    }
    intent.capturedMinor -= amountMinor;
    return { refunded: true };
  }

  private assertAvailable(): Promise<void> {
    if (this.config.get<string>('PSP_FAULT_MODE') === 'outage') {
      return Promise.reject(new PspUnavailableError());
    }
    return Promise.resolve();
  }
}
