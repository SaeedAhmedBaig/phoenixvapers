import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { CartModule } from '../cart/cart.module';
import { IdentityModule } from '../identity/identity.module';
import { OrdersModule } from '../orders/orders.module';
import { PaymentsModule } from '../payments/payments.module';
import { PricingModule } from '../pricing/pricing.module';
import { VerificationModule } from '../verification/verification.module';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';

/**
 * Checkout bounded context (spec §6.3) [COMPLIANCE] — pure orchestration.
 * Owns no collections: it composes Cart, Identity, Verification, Pricing,
 * Payments, and Orders into the one flow where money moves.
 */
@Module({
  imports: [
    CartModule,
    IdentityModule,
    VerificationModule,
    PricingModule,
    PaymentsModule,
    OrdersModule,
    AuditModule,
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
