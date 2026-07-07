import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Review } from "./schemas/review.schema";
import { CreateReviewDto } from "./dto/review.dto";
import { ProductsService } from "../catalogue/products.service";
import { Paginated, paginate } from "../../common/dto/pagination.dto";

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly model: Model<Review>,
    private readonly productsService: ProductsService,
  ) {}

  async list(productSlug: string, page = 1, limit = 20): Promise<Paginated<Review>> {
    const product = await this.productsService.findBySlug(productSlug);
    const [items, total] = await Promise.all([
      this.model
        .find({ product: product._id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean() as any,
      this.model.countDocuments({ product: product._id }),
    ]);
    return paginate(items as Review[], total, page, limit);
  }

  async create(dto: CreateReviewDto, userId: string, authorName: string): Promise<Review> {
    const product = await this.productsService.findBySlug(dto.productSlug);
    const review = await this.model.create({
      product: product._id,
      user: userId,
      authorName,
      rating: dto.rating,
      title: dto.title,
      body: dto.body,
    });
    await this.recomputeAggregate(product._id.toString());
    return review;
  }

  async remove(id: string): Promise<void> {
    const review = await this.model.findById(id);
    if (!review) return;
    await this.model.deleteOne({ _id: id });
    await this.recomputeAggregate(review.product.toString());
  }

  private async recomputeAggregate(productId: string): Promise<void> {
    const [agg] = await this.model.aggregate([
      { $match: { product: new Types.ObjectId(productId) } },
      { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    await this.productsService.updateRatingCache(productId, agg?.avg ?? 0, agg?.count ?? 0);
  }
}
