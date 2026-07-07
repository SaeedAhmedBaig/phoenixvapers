import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { PERMISSIONS } from "../../common/constants/permissions";
import type { AuthUser } from "../../common/types/auth-user.type";
import { ProductsService } from "./products.service";
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from "./dto/product.dto";

@Controller("catalogue/products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  list(@Query() query: ProductQueryDto) {
    return this.productsService.list(query);
  }

  @Public()
  @Get(":slug")
  findOne(@Param("slug") slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Public()
  @Get(":slug/related")
  related(@Param("slug") slug: string) {
    return this.productsService.findBySlug(slug).then((product) =>
      this.productsService.findByCategorySlug(product.categorySlug, slug),
    );
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions(PERMISSIONS.CATALOGUE_WRITE)
  create(@Body() dto: CreateProductDto, @CurrentUser() user: AuthUser) {
    return this.productsService.create(dto, user);
  }

  @Patch(":slug")
  @UseGuards(PermissionsGuard)
  @Permissions(PERMISSIONS.CATALOGUE_WRITE)
  update(@Param("slug") slug: string, @Body() dto: UpdateProductDto, @CurrentUser() user: AuthUser) {
    return this.productsService.update(slug, dto, user);
  }

  @Delete(":slug")
  @UseGuards(PermissionsGuard)
  @Permissions(PERMISSIONS.CATALOGUE_WRITE)
  remove(@Param("slug") slug: string, @CurrentUser() user: AuthUser) {
    return this.productsService.remove(slug, user);
  }
}
