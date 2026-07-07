import { Type } from "class-transformer";
import { IsEmail, IsIn, IsInt, IsOptional, IsString, Min, ValidateNested } from "class-validator";

export class CheckoutAddressDto {
  @IsString() fullName: string;

  @IsString() line1: string;

  @IsOptional() @IsString() line2?: string;

  @IsString() city: string;

  @IsOptional() @IsString() county?: string;

  @IsString() postcode: string;

  @IsOptional() @IsString() country?: string;
}

export class CreateOrderDto {
  @IsEmail() email: string;

  @ValidateNested()
  @Type(() => CheckoutAddressDto)
  address: CheckoutAddressDto;

  @IsString() shippingMethodCode: string;

  /** Anonymous session identifier used to look up age verification when the shopper is a guest. */
  @IsOptional() @IsString() ageVerificationSubjectKey?: string;

  @IsOptional() @IsInt() @Min(0) redeemPoints?: number;
}

export class UpdateOrderStatusDto {
  @IsIn(["pending_payment", "paid", "dispatched", "delivered", "cancelled", "refunded"])
  status: string;

  @IsOptional() @IsString() trackingNumber?: string;
}
