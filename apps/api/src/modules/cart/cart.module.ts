import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CatalogueModule } from '../catalogue/catalogue.module';
import { IdentityModule } from '../identity/identity.module';
import { PricingModule } from '../pricing/pricing.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Cart, CartSchema } from './schemas/cart.schema';

/**
 * Cart bounded context (spec §6.2) — owns the carts collection.
 * Checkout consumes the exported CartService for its revalidated read
 * and the post-order clear; nothing else touches carts directly.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
    CatalogueModule,
    PricingModule,
    IdentityModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
