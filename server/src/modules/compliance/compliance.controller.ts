import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { PERMISSIONS } from "../../common/constants/permissions";
import { ComplianceService } from "./compliance.service";
import { RecordAgeVerificationDto, UpdateComplianceRuleDto } from "./dto/compliance.dto";

@Controller("compliance")
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Public()
  @Get("rules")
  listRules() {
    return this.complianceService.listRules();
  }

  @Patch("rules/:key")
  @UseGuards(PermissionsGuard)
  @Permissions(PERMISSIONS.COMPLIANCE_MANAGE)
  updateRule(@Param("key") key: string, @Body() dto: UpdateComplianceRuleDto) {
    return this.complianceService.updateRule(key, dto);
  }

  @Public()
  @Post("age-verification")
  recordVerification(@Body() dto: RecordAgeVerificationDto) {
    return this.complianceService.recordAgeVerification(dto);
  }
}
