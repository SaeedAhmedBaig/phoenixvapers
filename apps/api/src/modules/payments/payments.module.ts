import { Module } from '@nestjs/common';

import { MockPspAdapter } from './adapters/mock-psp.adapter';
import { PAYMENT_PORT } from './payments.port';

/**
 * Payments bounded context (spec §6.4).
 *
 * Exports only the PAYMENT_PORT token — consumers (checkout, later
 * subscriptions and refunds) depend on the interface, never an adapter.
 * PSP_PROVIDER selects the adapter; 'mock' is the only Edition 1.0
 * adapter until the production PCI-DSS PSP integration lands.
 */
@Module({
  providers: [
    MockPspAdapter,
    { provide: PAYMENT_PORT, useExisting: MockPspAdapter },
  ],
  exports: [PAYMENT_PORT],
})
export class PaymentsModule {}
