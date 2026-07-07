import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { PERMISSIONS } from "../../common/constants/permissions";
import { SettingsService } from "./settings.service";

@Controller("settings")
@UseGuards(PermissionsGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Permissions(PERMISSIONS.SETTINGS_MANAGE)
  findAll() {
    return this.settingsService.findAll();
  }

  @Patch(":key")
  @Permissions(PERMISSIONS.SETTINGS_MANAGE)
  set(@Param("key") key: string, @Body() body: { value: unknown; description?: string }) {
    return this.settingsService.set(key, body.value, body.description);
  }
}
