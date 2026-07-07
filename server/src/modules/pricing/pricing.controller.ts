import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { PERMISSIONS } from "../../common/constants/permissions";
import { PricingService } from "./pricing.service";
import { CreatePromotionDto } from "./dto/promotion.dto";

@Controller("pricing/promotions")
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Public()
  @Get()
  findAll() {
    return this.pricingService.findAllActive();
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions(PERMISSIONS.PRICING_MANAGE)
  create(@Body() dto: CreatePromotionDto) {
    return this.pricingService.create(dto);
  }

  @Patch(":code")
  @UseGuards(PermissionsGuard)
  @Permissions(PERMISSIONS.PRICING_MANAGE)
  update(@Param("code") code: string, @Body() dto: Partial<CreatePromotionDto>) {
    return this.pricingService.update(code, dto);
  }
}
