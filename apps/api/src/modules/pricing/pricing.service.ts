import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  priceDelivery,
  priceLine,
  priceUnit,
  sumBreakdowns,
  type PriceBreakdown,
  type PricingParams,
  type UnitPricingInput,
} from './pricing.engine';

/**
 * Configuration edge of the pricing engine (spec §6.5) [COMPLIANCE].
 *
 * Resolves duty/VAT parameters from validated environment configuration
 * (§4.4: rates are configuration, not code) and hands them to the pure
 * engine. Feature modules inject THIS service — never re-implement money
 * maths locally.
 *
 * Promotions (§6.5 "promotions hook"): Edition 1.0 ships the hook only —
 * `applyPromotions` is the seam where the Phase 8 promotions module will
 * adjust net prices before duty/VAT are computed.
 */
@Injectable()
export class PricingService {
  readonly params: PricingParams;

  constructor(config: ConfigService) {
    this.params = {
      dutyMinorPer10Ml: config.getOrThrow<number>('VPD_DUTY_MINOR_PER_10ML'),
      vatRateBp: config.getOrThrow<number>('VAT_RATE_BP'),
    };
  }

  /** Display price for one unit of a variant (PLP/PDP/basket line unit). */
  unit(input: UnitPricingInput): PriceBreakdown {
    return priceUnit(this.applyPromotions(input), this.params);
  }

  /** Priced basket/order line: `quantity` units, VAT rounded at line level. */
  line(input: UnitPricingInput, quantity: number): PriceBreakdown {
    return priceLine(this.applyPromotions(input), quantity, this.params);
  }

  /** Delivery is a duty-free, VAT-carrying line in the same breakdown. */
  delivery(netMinor: number): PriceBreakdown {
    return priceDelivery(netMinor, this.params);
  }

  /** Order/cart totals are exact sums of already-rounded lines. */
  total(parts: PriceBreakdown[]): PriceBreakdown {
    return sumBreakdowns(parts);
  }

  /** Promotions hook — identity until the promotions module lands. */
  private applyPromotions(input: UnitPricingInput): UnitPricingInput {
    return input;
  }
}
