import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Brand, BrandSchema } from "./schemas/brand.schema";
import { Category, CategorySchema } from "./schemas/category.schema";
import { Product, ProductSchema } from "./schemas/product.schema";
import { BrandsService } from "./brands.service";
import { CategoriesService } from "./categories.service";
import { ProductsService } from "./products.service";
import { BrandsController } from "./brands.controller";
import { CategoriesController } from "./categories.controller";
import { ProductsController } from "./products.controller";
import { ComplianceModule } from "../compliance/compliance.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Brand.name, schema: BrandSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    ComplianceModule,
  ],
  controllers: [BrandsController, CategoriesController, ProductsController],
  providers: [BrandsService, CategoriesService, ProductsService],
  exports: [BrandsService, CategoriesService, ProductsService, MongooseModule],
})
export class CatalogueModule {}
