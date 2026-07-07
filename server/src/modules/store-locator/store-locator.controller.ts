import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { PERMISSIONS } from "../../common/constants/permissions";
import { StoreLocatorService } from "./store-locator.service";
import type { Store } from "./schemas/store.schema";

@Controller("stores")
export class StoreLocatorController {
  constructor(private readonly storeLocatorService: StoreLocatorService) {}

  @Public()
  @Get()
  findAll(@Query("postcode") postcode?: string) {
    return postcode ? this.storeLocatorService.findByPostcode(postcode) : this.storeLocatorService.findAll();
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions(PERMISSIONS.STORES_MANAGE)
  create(@Body() dto: Partial<Store>) {
    return this.storeLocatorService.create(dto);
  }
}
