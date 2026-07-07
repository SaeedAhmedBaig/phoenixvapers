import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Cart, CartSchema } from "./schemas/cart.schema";
import { CartService } from "./cart.service";
import { CartController } from "./cart.controller";
import { CatalogueModule } from "../catalogue/catalogue.module";
import { PricingModule } from "../pricing/pricing.module";
import { ShippingModule } from "../shipping/shipping.module";
import { TaxModule } from "../tax/tax.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
    CatalogueModule,
    PricingModule,
    ShippingModule,
    TaxModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
