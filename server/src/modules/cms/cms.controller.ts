import { Body, Controller, Get, Param, Put, UseGuards } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { PERMISSIONS } from "../../common/constants/permissions";
import { CmsService } from "./cms.service";
import type { Page } from "./schemas/page.schema";

@Controller("cms/pages")
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Public()
  @Get()
  findAll() {
    return this.cmsService.findAll();
  }

  @Public()
  @Get(":slug")
  findOne(@Param("slug") slug: string) {
    return this.cmsService.findBySlug(slug);
  }

  @Put(":slug")
  @UseGuards(PermissionsGuard)
  @Permissions(PERMISSIONS.CMS_MANAGE)
  upsert(@Param("slug") slug: string, @Body() dto: Partial<Page>) {
    return this.cmsService.upsert(slug, dto);
  }
}
