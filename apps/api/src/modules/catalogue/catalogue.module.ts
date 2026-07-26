import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PricingModule } from '../pricing/pricing.module';
import { CatalogueAdminController } from './catalogue-admin.controller';
import { CatalogueController } from './catalogue.controller';
import { CatalogueService } from './catalogue.service';
import { Product, ProductSchema } from './schemas/product.schema';

/**
 * Catalogue bounded context (spec §16.2) — owns the products collection.
 * Other modules (Search, Cart, Checkout) consume the exported
 * CatalogueService interface; they never touch the collection directly.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    PricingModule,
  ],
  controllers: [CatalogueController, CatalogueAdminController],
  providers: [CatalogueService],
  exports: [CatalogueService],
})
export class CatalogueModule {}
