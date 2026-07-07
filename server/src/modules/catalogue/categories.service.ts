import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Category } from "./schemas/category.schema";
import { CreateCategoryDto } from "./dto/brand-category.dto";
import { slugify } from "../../common/utils/slugify.util";

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private readonly model: Model<Category>) {}

  findAll(): Promise<Category[]> {
    return this.model.find().sort({ name: 1 }).lean() as any;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.model.findOne({ slug }).lean() as any;
    if (!category) throw new NotFoundException(`Category "${slug}" not found`);
    return category;
  }

  create(dto: CreateCategoryDto): Promise<Category> {
    return this.model.create({ ...dto, slug: dto.slug ?? slugify(dto.name) });
  }
}
