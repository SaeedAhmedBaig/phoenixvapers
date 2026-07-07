import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { BrandsService } from "../modules/catalogue/brands.service";
import { CategoriesService } from "../modules/catalogue/categories.service";
import { ProductsService } from "../modules/catalogue/products.service";
import { InventoryService } from "../modules/inventory/inventory.service";
import { PricingService } from "../modules/pricing/pricing.service";
import { CmsService } from "../modules/cms/cms.service";
import { StoreLocatorService } from "../modules/store-locator/store-locator.service";
import type { AuthUser } from "../common/types/auth-user.type";
import { brandSeeds } from "./data/brands";
import { categorySeeds } from "./data/categories";
import { productSeeds } from "./data/products";
import { promotionSeeds } from "./data/promotions";
import { pageSeeds } from "./data/pages";
import { storeSeeds } from "./data/stores";

const SEED_ACTOR: AuthUser = {
  userId: "seed-script",
  email: "seed@phoenixvapers.co.uk",
  role: "super-admin",
  permissions: ["*"],
  brandScope: [],
};

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ["error", "warn"] });

  const brandsService = app.get(BrandsService);
  const categoriesService = app.get(CategoriesService);
  const productsService = app.get(ProductsService);
  const inventoryService = app.get(InventoryService);
  const pricingService = app.get(PricingService);
  const cmsService = app.get(CmsService);
  const storeLocatorService = app.get(StoreLocatorService);

  console.log("Seeding categories...");
  for (const category of categorySeeds) {
    await categoriesService.findBySlug(category.slug).catch(() => categoriesService.create(category));
  }

  console.log("Seeding brands...");
  for (const brand of brandSeeds) {
    await brandsService.findBySlug(brand.slug).catch(() => brandsService.create(brand));
  }

  console.log("Seeding products + inventory...");
  for (const seed of productSeeds) {
    const { stockQty, ...productDto } = seed;
    const product = await productsService.findBySlug(seed.slug).catch(async () => {
      return productsService.create(productDto, SEED_ACTOR);
    });
    await inventoryService.ensureForProduct(product.id ?? (product as any)._id.toString(), stockQty);
  }

  console.log("Seeding promotions...");
  const existingPromotions = await pricingService.findAllActive();
  for (const promo of promotionSeeds) {
    if (!existingPromotions.some((existing) => existing.code === promo.code)) {
      await pricingService.create(promo as any);
    }
  }

  console.log("Seeding CMS pages...");
  for (const page of pageSeeds) {
    await cmsService.upsert(page.slug, page as any);
  }

  console.log("Seeding stores...");
  const existingStores = await storeLocatorService.findAll();
  for (const store of storeSeeds) {
    if (!existingStores.some((existing) => existing.name === store.name)) {
      await storeLocatorService.create(store as any);
    }
  }

  console.log("Seed complete.");
  await app.close();
  process.exit(0);
}

run().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
