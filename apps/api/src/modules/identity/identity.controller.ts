import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { z } from 'zod';

import { RequireRoles } from '../../common/auth/roles.decorator';
import { OperatorRole } from '../../common/auth/roles';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { AuthService } from './auth.service';
import { CustomerAuthGuard } from './customer-auth.guard';
import { CurrentCustomer } from './current-customer.decorator';
import { CustomersService } from './customers.service';
import { toPublicCustomer } from './identity.serializer';
import type { AuthenticatedCustomer } from './jwt.strategy';
import { OperatorAuthGuard } from './operator-auth.guard';
import type { AuthenticatedOperator } from './operator-jwt.strategy';
import { OperatorsService } from './operators.service';
import {
  addressSchema,
  consentsSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  updateProfileSchema,
  type AddressDto,
  type ConsentsDto,
  type LoginDto,
  type RefreshDto,
  type RegisterDto,
  type UpdateProfileDto,
} from './dto/identity.dto';

const addressIndexSchema = z.coerce.number().int().min(0).max(19);

/** Credential endpoints get a much tighter throttle than the global one. */
const AUTH_THROTTLE = { default: { ttl: 60_000, limit: 10 } };

@Controller()
export class IdentityController {
  constructor(
    private readonly auth: AuthService,
    private readonly customers: CustomersService,
    private readonly operators: OperatorsService,
  ) {}

  /* ─────────────────────────── auth ──────────────────────────────── */

  @Post('auth/register')
  @Throttle(AUTH_THROTTLE)
  async register(
    @Body(new ZodValidationPipe(registerSchema)) dto: RegisterDto,
  ) {
    const { customer, tokens } = await this.auth.register(dto);
    return { customer: toPublicCustomer(customer), ...tokens };
  }

  @Post('auth/login')
  @HttpCode(200)
  @Throttle(AUTH_THROTTLE)
  async login(@Body(new ZodValidationPipe(loginSchema)) dto: LoginDto) {
    const result = await this.auth.login(dto.email, dto.password);

    // The storefront routes on `principalType`: customers → account,
    // operators → admin. Only public fields cross the wire (no hashes).
    if (result.principalType === 'operator') {
      const { operator, tokens } = result;
      return {
        principalType: 'operator',
        operator: {
          email: operator.email,
          firstName: operator.firstName,
          lastName: operator.lastName,
          role: operator.role,
        },
        ...tokens,
      };
    }

    return {
      principalType: 'customer',
      customer: toPublicCustomer(result.customer),
      ...result.tokens,
    };
  }

  @Post('auth/refresh')
  @HttpCode(200)
  @Throttle(AUTH_THROTTLE)
  refresh(@Body(new ZodValidationPipe(refreshSchema)) dto: RefreshDto) {
    return this.auth.rotate(dto.refreshToken);
  }

  @Post('auth/logout')
  @HttpCode(204)
  async logout(@Body(new ZodValidationPipe(refreshSchema)) dto: RefreshDto) {
    await this.auth.logout(dto.refreshToken);
  }

  /* ─────────────────── operator session (whoami) ──────────────────── */

  /**
   * Who the current operator is — the admin console's role gate. Any of the
   * three staff roles may read their own identity; a customer token or no
   * token is rejected (401/403), which is exactly how the storefront knows
   * a session may enter /admin.
   */
  @Get('operator/me')
  @UseGuards(OperatorAuthGuard)
  // Any authenticated operator may read their own identity — this is the
  // console's role gate, so every role must pass it. Spreading the enum
  // keeps future roles included automatically.
  @RequireRoles(...Object.values(OperatorRole))
  async operatorMe(@Req() req: Request & { user: AuthenticatedOperator }) {
    const operator = await this.operators.requireById(req.user.operatorId);
    return {
      email: operator.email,
      firstName: operator.firstName,
      lastName: operator.lastName,
      role: operator.role,
    };
  }

  /* ──────────────────────── account (me) ─────────────────────────── */

  @Get('me')
  @UseGuards(CustomerAuthGuard)
  async me(@CurrentCustomer() auth: AuthenticatedCustomer) {
    return toPublicCustomer(await this.customers.requireById(auth.customerId));
  }

  @Patch('me')
  @UseGuards(CustomerAuthGuard)
  async updateProfile(
    @CurrentCustomer() auth: AuthenticatedCustomer,
    @Body(new ZodValidationPipe(updateProfileSchema)) dto: UpdateProfileDto,
  ) {
    return toPublicCustomer(
      await this.customers.updateProfile(auth.customerId, dto),
    );
  }

  @Post('me/addresses')
  @UseGuards(CustomerAuthGuard)
  async addAddress(
    @CurrentCustomer() auth: AuthenticatedCustomer,
    @Body(new ZodValidationPipe(addressSchema)) dto: AddressDto,
  ) {
    return toPublicCustomer(
      await this.customers.addAddress(auth.customerId, dto),
    );
  }

  @Delete('me/addresses/:index')
  @UseGuards(CustomerAuthGuard)
  async removeAddress(
    @CurrentCustomer() auth: AuthenticatedCustomer,
    @Param('index', new ZodValidationPipe(addressIndexSchema)) index: number,
  ) {
    return toPublicCustomer(
      await this.customers.removeAddress(auth.customerId, index),
    );
  }

  @Put('me/consents')
  @UseGuards(CustomerAuthGuard)
  async updateConsents(
    @CurrentCustomer() auth: AuthenticatedCustomer,
    @Body(new ZodValidationPipe(consentsSchema)) dto: ConsentsDto,
  ) {
    return toPublicCustomer(
      await this.customers.updateConsents(auth.customerId, dto),
    );
  }
}
