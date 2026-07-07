import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { PERMISSIONS } from "../../common/constants/permissions";
import { RbacService } from "./rbac.service";
import { CreateRoleDto, UpdateRoleDto } from "./dto/role.dto";

@Controller("rbac/roles")
@UseGuards(PermissionsGuard)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get()
  @Permissions(PERMISSIONS.RBAC_MANAGE)
  findAll() {
    return this.rbacService.findAll();
  }

  @Post()
  @Permissions(PERMISSIONS.RBAC_MANAGE)
  create(@Body() dto: CreateRoleDto) {
    return this.rbacService.create(dto);
  }

  @Patch(":name")
  @Permissions(PERMISSIONS.RBAC_MANAGE)
  update(@Param("name") name: string, @Body() dto: UpdateRoleDto) {
    return this.rbacService.update(name, dto);
  }
}
