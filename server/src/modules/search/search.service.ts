import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Product } from "../catalogue/schemas/product.schema";

/**
 * MongoDB text-index search today; the interface is intentionally narrow so
 * this service can be swapped for a Meilisearch/Typesense-backed
 * implementation later (Volume 3, Section 3.1) without touching callers.
 */
@Injectable()
export class SearchService {
  constructor(@InjectModel(Product.name) private readonly productModel: Model<Product>) {}

  async searchProducts(q: string, limit = 20) {
    if (!q?.trim()) return [];
    return this.productModel
      .find({ $text: { $search: q } }, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .lean() as any;
  }
}
