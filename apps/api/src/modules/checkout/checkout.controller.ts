import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { CurrentCustomer } from '../identity/current-customer.decorator';
import { CustomerAuthGuard } from '../identity/customer-auth.guard';
import type { AuthenticatedCustomer } from '../identity/jwt.strategy';
import { CheckoutService } from './checkout.service';
import { placeOrderSchema, type PlaceOrderDto } from './dto/checkout.dto';

/** Money endpoints get a tight throttle — 10 attempts a minute is plenty. */
const CHECKOUT_THROTTLE = { default: { ttl: 60_000, limit: 10 } };

/**
 * Checkout endpoints (spec §6.3) — strictly customer-authenticated.
 * Guests reach the basket; only verified, signed-in adults reach money.
 */
@Controller('checkout')
@UseGuards(CustomerAuthGuard)
export class CheckoutController {
  constructor(private readonly checkout: CheckoutService) {}

  /** Revalidated basket + addresses + delivery options, one read. */
  @Get('context')
  context(@CurrentCustomer() auth: AuthenticatedCustomer) {
    return this.checkout.context(auth.customerId);
  }

  @Post()
  @Throttle(CHECKOUT_THROTTLE)
  placeOrder(
    @CurrentCustomer() auth: AuthenticatedCustomer,
    @Body(new ZodValidationPipe(placeOrderSchema)) dto: PlaceOrderDto,
  ) {
    return this.checkout.placeOrder(auth.customerId, dto);
  }
}
