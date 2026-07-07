import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Review, ReviewSchema } from "./schemas/review.schema";
import { ReviewsService } from "./reviews.service";
import { ReviewsController } from "./reviews.controller";
import { CatalogueModule } from "../catalogue/catalogue.module";

@Module({
  imports: [MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]), CatalogueModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
