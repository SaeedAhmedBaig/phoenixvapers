import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { Product } from "./schemas/product.schema";
import { BrandsService } from "./brands.service";
import { CategoriesService } from "./categories.service";
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from "./dto/product.dto";
import { ComplianceService } from "../compliance/compliance.service";
import { Paginated, paginate } from "../../common/dto/pagination.dto";
import { slugify } from "../../common/utils/slugify.util";
import { assertBrandScope } from "../../common/guards/brand-scope.util";
import type { AuthUser } from "../../common/types/auth-user.type";

export interface ProductFacets {
  formats: string[];
  flavours: string[];
  brands: string[];
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly model: Model<Product>,
    private readonly brandsService: BrandsService,
    private readonly categoriesService: CategoriesService,
    private readonly complianceService: ComplianceService,
  ) {}

  async list(query: ProductQueryDto): Promise<Paginated<Product> & { facets: ProductFacets }> {
    const filter: FilterQuery<Product> = {};
    if (query.category) filter.categorySlug = query.category;
    if (query.collection) filter.collectionTag = query.collection;
    if (query.brand) filter.brandName = { $in: splitCsv(query.brand) };
    if (query.format) filter.format = { $in: splitCsv(query.format) };
    if (query.flavour) filter.flavour = { $in: splitCsv(query.flavour) };
    if (query.onlyDeals) filter.compareAtMinor = { $exists: true, $ne: null };
    if (query.q) filter.$text = { $search: query.q };

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sort = this.resolveSort(query.sort);

    const [items, total, facets] = await Promise.all([
      this.model
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean() as any,
      this.model.countDocuments(filter),
      this.computeFacets(filter),
    ]);

    return { ...paginate(items as Product[], total, page, limit), facets };
  }

  private resolveSort(sort?: string): Record<string, 1 | -1> {
    switch (sort) {
      case "price-asc":
        return { priceMinor: 1 };
      case "price-desc":
        return { priceMinor: -1 };
      case "rating":
        return { ratingAvg: -1 };
      default:
        return { createdAt: -1 };
    }
  }

  private async computeFacets(baseFilter: FilterQuery<Product>): Promise<ProductFacets> {
    const [formats, flavours, brands] = await Promise.all([
      this.model.distinct("format", baseFilter),
      this.model.distinct("flavour", { ...baseFilter, flavour: { $ne: null } }),
      this.model.distinct("brandName", baseFilter),
    ]);
    return {
      formats: (formats as string[]).sort(),
      flavours: (flavours as string[]).sort(),
      brands: (brands as string[]).sort(),
    };
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.model.findOne({ slug }).lean() as any;
    if (!product) throw new NotFoundException(`Product "${slug}" not found`);
    return product;
  }

  async create(dto: CreateProductDto, user: AuthUser): Promise<Product> {
    const brand = await this.brandsService.findBySlug(dto.brandSlug);
    assertBrandScope(user, brand.id);
    const category = await this.categoriesService.findBySlug(dto.categorySlug);

    await this.complianceService.assertProductCompliant({
      category: category.slug,
      nicotineMg: dto.nicotineMg,
    });

    const { collection, ...rest } = dto;
    return this.model.create({
      ...rest,
      collectionTag: collection,
      slug: dto.slug ?? slugify(dto.name),
      brand: brand._id,
      brandName: brand.name,
      brandSlug: brand.slug,
      category: category._id,
      categorySlug: category.slug,
    });
  }

  async update(slug: string, dto: UpdateProductDto, user: AuthUser): Promise<Product> {
    const existing = await this.findBySlug(slug);
    assertBrandScope(user, existing.brand.toString());

    const brand = await this.brandsService.findBySlug(dto.brandSlug);
    assertBrandScope(user, brand.id);
    const category = await this.categoriesService.findBySlug(dto.categorySlug);

    await this.complianceService.assertProductCompliant({
      category: category.slug,
      nicotineMg: dto.nicotineMg,
    });

    const { collection, ...rest } = dto;
    const updated = await this.model
      .findOneAndUpdate(
        { slug },
        {
          ...rest,
          collectionTag: collection,
          brand: brand._id,
          brandName: brand.name,
          brandSlug: brand.slug,
          category: category._id,
          categorySlug: category.slug,
        },
        { new: true },
      )
      .lean() as any;
    if (!updated) throw new NotFoundException(`Product "${slug}" not found`);
    return updated as Product;
  }

  async remove(slug: string, user: AuthUser): Promise<void> {
    const existing = await this.findBySlug(slug);
    assertBrandScope(user, existing.brand.toString());
    await this.model.deleteOne({ slug });
  }

  async updateRatingCache(productId: string, ratingAvg: number, ratingCount: number): Promise<void> {
    await this.model.updateOne({ _id: productId }, { ratingAvg, ratingCount });
  }

  async updateStockStatusCache(productId: string, stockStatus: "in" | "low" | "out"): Promise<void> {
    await this.model.updateOne({ _id: productId }, { stockStatus });
  }

  async findByCategorySlug(categorySlug: string, excludeSlug: string, limit = 4): Promise<Product[]> {
    return this.model
      .find({ categorySlug, slug: { $ne: excludeSlug } })
      .limit(limit)
      .lean() as any;
  }
}

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}
