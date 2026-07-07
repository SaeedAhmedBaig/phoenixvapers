import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Promotion, PromotionSchema } from "./schemas/promotion.schema";
import { PricingService } from "./pricing.service";
import { PricingController } from "./pricing.controller";

@Module({
  imports: [MongooseModule.forFeature([{ name: Promotion.name, schema: PromotionSchema }])],
  controllers: [PricingController],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
