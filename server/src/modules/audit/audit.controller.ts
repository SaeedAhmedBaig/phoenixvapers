import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { PERMISSIONS } from "../../common/constants/permissions";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import { AuditService } from "./audit.service";

@Controller("audit")
@UseGuards(PermissionsGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Permissions(PERMISSIONS.AUDIT_READ)
  list(@Query() query: PaginationQueryDto, @Query("entityType") entityType?: string) {
    return this.auditService.list(query.page ?? 1, query.limit ?? 20, entityType);
  }

  @Get(":id")
  @Permissions(PERMISSIONS.AUDIT_READ)
  findOne(@Param("id") id: string) {
    return this.auditService.findById(id);
  }
}
