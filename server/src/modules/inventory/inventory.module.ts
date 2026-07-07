import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { StockItem, StockItemSchema } from "./schemas/stock-item.schema";
import { InventoryService } from "./inventory.service";
import { InventoryController } from "./inventory.controller";
import { CatalogueModule } from "../catalogue/catalogue.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: StockItem.name, schema: StockItemSchema }]),
    CatalogueModule,
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
