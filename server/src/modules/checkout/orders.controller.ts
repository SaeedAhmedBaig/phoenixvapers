import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { PERMISSIONS } from "../../common/constants/permissions";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import type { AuthUser } from "../../common/types/auth-user.type";
import { OrdersService } from "./orders.service";
import { UpdateOrderStatusDto } from "./dto/checkout.dto";
import type { OrderStatus } from "./schemas/order.schema";

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get("me")
  listMine(@CurrentUser() user: AuthUser, @Query() query: PaginationQueryDto) {
    return this.ordersService.listForUser(user.userId, query.page, query.limit);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions(PERMISSIONS.ORDERS_MANAGE)
  listAll(@Query() query: PaginationQueryDto, @Query("status") status?: string) {
    return this.ordersService.listAll(query.page, query.limit, status);
  }

  @Get(":orderNumber")
  findOne(@Param("orderNumber") orderNumber: string, @CurrentUser() user: AuthUser) {
    return this.ordersService.findByOrderNumber(orderNumber, user);
  }

  @Patch(":orderNumber/status")
  @UseGuards(PermissionsGuard)
  @Permissions(PERMISSIONS.ORDERS_MANAGE)
  updateStatus(@Param("orderNumber") orderNumber: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(orderNumber, dto.status as OrderStatus, dto.trackingNumber);
  }
}
