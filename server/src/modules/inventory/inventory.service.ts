import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { StockItem } from "./schemas/stock-item.schema";
import { ProductsService } from "../catalogue/products.service";

type StockStatus = "in" | "low" | "out";

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(StockItem.name) private readonly model: Model<StockItem>,
    private readonly productsService: ProductsService,
  ) {}

  async ensureForProduct(productId: string, quantityOnHand = 100): Promise<StockItem> {
    const existing = await this.model.findOne({ product: productId });
    if (existing) return existing;
    return this.model.create({ product: productId, quantityOnHand });
  }

  async getForProduct(productId: string): Promise<StockItem | null> {
    return this.model.findOne({ product: productId }).lean() as any;
  }

  available(item: Pick<StockItem, "quantityOnHand" | "quantityReserved">): number {
    return item.quantityOnHand - item.quantityReserved;
  }

  private statusFor(item: StockItem): StockStatus {
    const available = this.available(item);
    if (available <= 0) return "out";
    if (available <= item.lowStockThreshold) return "low";
    return "in";
  }

  private async syncProductCache(item: StockItem): Promise<void> {
    await this.productsService.updateStockStatusCache(item.product.toString(), this.statusFor(item));
  }

  /** Reserves stock at checkout time; throws if insufficient availability. */
  async reserve(productId: string, qty: number): Promise<void> {
    const item = await this.model.findOne({ product: productId });
    if (!item || this.available(item) < qty) {
      throw new BadRequestException("Insufficient stock available");
    }
    item.quantityReserved += qty;
    await item.save();
    await this.syncProductCache(item);
  }

  async release(productId: string, qty: number): Promise<void> {
    const item = await this.model.findOne({ product: productId });
    if (!item) return;
    item.quantityReserved = Math.max(0, item.quantityReserved - qty);
    await item.save();
    await this.syncProductCache(item);
  }

  /** Commits a reserved quantity to a permanent decrement (on dispatch). */
  async commit(productId: string, qty: number): Promise<void> {
    const item = await this.model.findOne({ product: productId });
    if (!item) return;
    item.quantityOnHand = Math.max(0, item.quantityOnHand - qty);
    item.quantityReserved = Math.max(0, item.quantityReserved - qty);
    await item.save();
    await this.syncProductCache(item);
  }

  async adjust(productId: string, delta: number): Promise<StockItem> {
    const item = await this.model.findOneAndUpdate(
      { product: new Types.ObjectId(productId) },
      { $inc: { quantityOnHand: delta } },
      { new: true, upsert: true },
    );
    await this.syncProductCache(item);
    return item;
  }
}
