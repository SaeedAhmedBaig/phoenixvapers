import { Body, Controller, Get, Post } from "@nestjs/common";
import { IsInt, Min } from "class-validator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthUser } from "../../common/types/auth-user.type";
import { LoyaltyService } from "./loyalty.service";

class RedeemPointsDto {
  @IsInt() @Min(1) points: number;
}

@Controller("loyalty")
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get("me")
  async me(@CurrentUser() user: AuthUser) {
    const [balance, ledger] = await Promise.all([
      this.loyaltyService.balance(user.userId),
      this.loyaltyService.ledger(user.userId),
    ]);
    return { balance, ledger };
  }

  @Post("redeem")
  redeem(@CurrentUser() user: AuthUser, @Body() dto: RedeemPointsDto) {
    return this.loyaltyService.redeem(user.userId, dto.points);
  }
}
