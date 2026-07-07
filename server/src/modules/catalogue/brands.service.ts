import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Brand } from "./schemas/brand.schema";
import { CreateBrandDto } from "./dto/brand-category.dto";
import { slugify } from "../../common/utils/slugify.util";

@Injectable()
export class BrandsService {
  constructor(@InjectModel(Brand.name) private readonly model: Model<Brand>) {}

  findAll(): Promise<Brand[]> {
    return this.model.find().sort({ name: 1 }).lean() as any;
  }

  async findBySlug(slug: string): Promise<Brand> {
    const brand = await this.model.findOne({ slug }).lean() as any;
    if (!brand) throw new NotFoundException(`Brand "${slug}" not found`);
    return brand;
  }

  create(dto: CreateBrandDto): Promise<Brand> {
    return this.model.create({ ...dto, slug: dto.slug ?? slugify(dto.name) });
  }
}
