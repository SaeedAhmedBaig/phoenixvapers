import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RbacService } from "./rbac.service";
import { PermissionSchema } from "./schemas/permission.schema";
import { RoleSchema } from "./schemas/role.schema";
import { AuditLogSchema } from "./schemas/audit-log.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Permission", schema: PermissionSchema },
      { name: "Role", schema: RoleSchema },
      { name: "AuditLog", schema: AuditLogSchema },
    ]),
  ],
  providers: [RbacService],
  exports: [RbacService],
})
export class RbacModule {}
