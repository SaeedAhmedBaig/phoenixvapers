import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Page, PageSchema } from "./schemas/page.schema";
import { CmsService } from "./cms.service";
import { CmsController } from "./cms.controller";

@Module({
  imports: [MongooseModule.forFeature([{ name: Page.name, schema: PageSchema }])],
  controllers: [CmsController],
  providers: [CmsService],
  exports: [CmsService],
})
export class CmsModule {}
