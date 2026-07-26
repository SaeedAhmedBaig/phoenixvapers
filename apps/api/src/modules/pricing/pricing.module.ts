import { Module } from '@nestjs/common';

import { PricingService } from './pricing.service';

/**
 * Pricing/Tax/Duty bounded context (spec §6.5) [COMPLIANCE].
 *
 * Stateless by design: it owns no collections, only the money maths.
 * Rate parameters come from validated environment configuration (§4.4).
 */
@Module({
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
