import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { IsInt } from "class-validator";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { PERMISSIONS } from "../../common/constants/permissions";
import { InventoryService } from "./inventory.service";

class AdjustStockDto {
  @IsInt() delta: number;
}

@Controller("inventory")
@UseGuards(PermissionsGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get(":productId")
  @Permissions(PERMISSIONS.INVENTORY_MANAGE)
  get(@Param("productId") productId: string) {
    return this.inventoryService.getForProduct(productId);
  }

  @Patch(":productId/adjust")
  @Permissions(PERMISSIONS.INVENTORY_MANAGE)
  adjust(@Param("productId") productId: string, @Body() dto: AdjustStockDto) {
    return this.inventoryService.adjust(productId, dto.delta);
  }
}
