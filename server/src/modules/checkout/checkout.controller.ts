import { Body, Controller, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { Public } from "../../common/decorators/public.decorator";
import type { AuthUser } from "../../common/types/auth-user.type";
import { CheckoutService } from "./checkout.service";
import { CreateOrderDto } from "./dto/checkout.dto";
import { CART_TOKEN_COOKIE } from "../cart/cart.controller";

@Controller("checkout")
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Public()
  @Post()
  async checkout(@Req() req: Request, @Body() dto: CreateOrderDto) {
    const user = (req as any).user as AuthUser | undefined;
    const token = req.cookies?.[CART_TOKEN_COOKIE];
    const result = await this.checkoutService.createOrder({ token, userId: user?.userId }, dto);
    return {
      orderNumber: result.order.orderNumber,
      status: result.order.status,
      totalMinor: result.order.totalMinor,
      clientSecret: result.clientSecret,
    };
  }
}
