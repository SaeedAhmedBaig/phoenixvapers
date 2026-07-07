import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Store, StoreSchema } from "./schemas/store.schema";
import { StoreLocatorService } from "./store-locator.service";
import { StoreLocatorController } from "./store-locator.controller";

@Module({
  imports: [MongooseModule.forFeature([{ name: Store.name, schema: StoreSchema }])],
  controllers: [StoreLocatorController],
  providers: [StoreLocatorService],
  exports: [StoreLocatorService],
})
export class StoreLocatorModule {}
