import { IsArray, IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateRoleDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateRoleDto {
  @IsString() name: string;

  @IsArray()
  @IsString({ each: true })
  permissions: string[];

  @IsOptional()
  @IsBoolean()
  brandScoped?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}
