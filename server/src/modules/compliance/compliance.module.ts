import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ComplianceRule, ComplianceRuleSchema } from "./schemas/compliance-rule.schema";
import { AgeVerification, AgeVerificationSchema } from "./schemas/age-verification.schema";
import { ComplianceService } from "./compliance.service";
import { ComplianceController } from "./compliance.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ComplianceRule.name, schema: ComplianceRuleSchema },
      { name: AgeVerification.name, schema: AgeVerificationSchema },
    ]),
  ],
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
