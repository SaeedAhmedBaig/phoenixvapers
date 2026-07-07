import { Controller, Get, UseGuards } from "@nestjs/common";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { PERMISSIONS } from "../../common/constants/permissions";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
@UseGuards(PermissionsGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Permissions(PERMISSIONS.NOTIFICATIONS_MANAGE)
  list() {
    return this.notificationsService.list();
  }
}
