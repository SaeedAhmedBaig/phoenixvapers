import { IsBoolean, IsOptional, IsString } from "class-validator";

export class RecordAgeVerificationDto {
  @IsString() subjectKey: string;

  @IsOptional() @IsString() provider?: string;

  @IsBoolean() confirmed: boolean;
}

export class UpdateComplianceRuleDto {
  value: unknown;

  @IsOptional() @IsString() description?: string;
}
