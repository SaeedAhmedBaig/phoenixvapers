import { Controller, Post, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RbacService } from "./rbac.service";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { PermissionsGuard } from "../../common/guards/permissions.guard";

@Controller("admin/rbac")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RbacController {
  constructor(private rbacService: RbacService) {}

  @Post("seed")
  @Permissions("settings.system")
  async seed() {
    const [perms, roles] = await Promise.all([
      this.rbacService.seedPermissions(),
      this.rbacService.seedRoles(),
    ]);
    return { permissions: perms, roles };
  }

  @Get("permissions")
  @Permissions("staff.permissions")
  async getPermissions() {
    return this.rbacService.getPermissions();
  }

  @Get("roles")
  @Permissions("staff.permissions")
  async getRoles() {
    return this.rbacService.getRoles();
  }
}
