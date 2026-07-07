import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { PERMISSIONS } from "../../common/constants/permissions";
import { BrandsService } from "./brands.service";
import { CreateBrandDto } from "./dto/brand-category.dto";

@Controller("catalogue/brands")
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Public()
  @Get()
  findAll() {
    return this.brandsService.findAll();
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions(PERMISSIONS.CATALOGUE_WRITE)
  create(@Body() dto: CreateBrandDto) {
    return this.brandsService.create(dto);
  }
}
