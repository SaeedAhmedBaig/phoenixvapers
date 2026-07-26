import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import {
  CurrentCustomer,
  CurrentCustomerOptional,
} from '../identity/current-customer.decorator';
import { CustomerAuthGuard } from '../identity/customer-auth.guard';
import { OptionalCustomerAuthGuard } from '../identity/optional-customer-auth.guard';
import type { AuthenticatedCustomer } from '../identity/jwt.strategy';
import { CartService, type CartIdentity } from './cart.service';
import {
  addLineSchema,
  cartTokenSchema,
  mergeCartSchema,
  skuParamSchema,
  updateLineSchema,
  type AddLineDto,
  type MergeCartDto,
  type UpdateLineDto,
} from './dto/cart.dto';

/**
 * Basket endpoints (spec §6.2) — served to guests and customers alike.
 *
 * Guests present their opaque cart token in the X-Cart-Token header
 * (stored in an httpOnly cookie by the storefront BFF, never readable by
 * browser JS). A signed-in customer's JWT always wins over a stray guest
 * header, so a stolen token cannot shadow an authenticated basket.
 */
@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  @UseGuards(OptionalCustomerAuthGuard)
  view(
    @CurrentCustomerOptional() auth: AuthenticatedCustomer | null,
    @Headers('x-cart-token') token?: string,
  ) {
    return this.cart.view(identityOf(auth, token));
  }

  @Post('items')
  @UseGuards(OptionalCustomerAuthGuard)
  addLine(
    @CurrentCustomerOptional() auth: AuthenticatedCustomer | null,
    @Body(new ZodValidationPipe(addLineSchema)) dto: AddLineDto,
    @Headers('x-cart-token') token?: string,
  ) {
    return this.cart.addLine(identityOf(auth, token), dto);
  }

  @Patch('items/:sku')
  @UseGuards(OptionalCustomerAuthGuard)
  updateLine(
    @CurrentCustomerOptional() auth: AuthenticatedCustomer | null,
    @Param('sku', new ZodValidationPipe(skuParamSchema)) sku: string,
    @Body(new ZodValidationPipe(updateLineSchema)) dto: UpdateLineDto,
    @Headers('x-cart-token') token?: string,
  ) {
    return this.cart.updateLine(identityOf(auth, token), sku, dto.quantity);
  }

  @Delete('items/:sku')
  @UseGuards(OptionalCustomerAuthGuard)
  removeLine(
    @CurrentCustomerOptional() auth: AuthenticatedCustomer | null,
    @Param('sku', new ZodValidationPipe(skuParamSchema)) sku: string,
    @Headers('x-cart-token') token?: string,
  ) {
    return this.cart.removeLine(identityOf(auth, token), sku);
  }

  /** Fold a guest basket into the account after sign-in — auth required. */
  @Post('merge')
  @UseGuards(CustomerAuthGuard)
  merge(
    @CurrentCustomer() auth: AuthenticatedCustomer,
    @Body(new ZodValidationPipe(mergeCartSchema)) dto: MergeCartDto,
  ) {
    return this.cart.merge(auth.customerId, dto.cartToken);
  }
}

/**
 * JWT identity first; otherwise the guest token — but only when it parses
 * as one of our tokens (a malformed header is treated as absent, not an
 * error, so a stale cookie can never brick the basket).
 */
function identityOf(
  auth: AuthenticatedCustomer | null,
  token?: string,
): CartIdentity {
  if (auth) return { customerId: auth.customerId };

  const parsed = cartTokenSchema.safeParse(token);
  return parsed.success ? { cartToken: parsed.data } : {};
}
