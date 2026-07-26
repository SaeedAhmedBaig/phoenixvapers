import { Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { CustomerAuthGuard } from '../identity/customer-auth.guard';
import { CurrentCustomer } from '../identity/current-customer.decorator';
import type { AuthenticatedCustomer } from '../identity/jwt.strategy';
import { VerificationService } from './verification.service';

/** Verification attempts are precious — throttle harder than reads. */
const CHECK_THROTTLE = { default: { ttl: 60_000, limit: 5 } };

/**
 * Customer-facing verification endpoints (spec §4.2/§19.1). All require
 * an authenticated customer; all decisions land in the audit trail.
 */
@Controller('verification')
@UseGuards(CustomerAuthGuard)
export class VerificationController {
  constructor(private readonly verification: VerificationService) {}

  @Post('initiate')
  @HttpCode(200)
  @Throttle(CHECK_THROTTLE)
  initiate(@CurrentCustomer() auth: AuthenticatedCustomer) {
    return this.verification.initiate(auth.customerId);
  }

  @Post('escalate')
  @HttpCode(200)
  @Throttle(CHECK_THROTTLE)
  escalate(@CurrentCustomer() auth: AuthenticatedCustomer) {
    return this.verification.escalate(auth.customerId);
  }

  @Get('status')
  status(@CurrentCustomer() auth: AuthenticatedCustomer) {
    return this.verification.status(auth.customerId);
  }
}
