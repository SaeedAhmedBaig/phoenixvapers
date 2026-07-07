import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Page } from "./schemas/page.schema";

@Injectable()
export class CmsService {
  constructor(@InjectModel(Page.name) private readonly model: Model<Page>) {}

  findAll(): Promise<Page[]> {
    return this.model.find().lean() as any;
  }

  async findBySlug(slug: string): Promise<Page> {
    const page = await this.model.findOne({ slug }).lean() as any;
    if (!page) throw new NotFoundException(`Page "${slug}" not found`);
    return page;
  }

  async upsert(slug: string, dto: Partial<Page>): Promise<Page> {
    return this.model.findOneAndUpdate({ slug }, { ...dto, slug }, { new: true, upsert: true }).lean() as any;
  }
}
