import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { AuthUser } from "../../common/types/auth-user.type";
import { CartService } from "./cart.service";
import { AddCartItemDto, UpdateCartItemDto } from "./dto/cart.dto";

export const CART_TOKEN_COOKIE = "pv_cart_token";

@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Public()
  @Get()
  async getCart(
    @Req() req: Request,
    @Query("shippingMethod") shippingMethod: string | undefined,
  ) {
    const user = (req as any).user as AuthUser | undefined;
    const cart = user
      ? await this.cartService.findByUser(user.userId)
      : await this.cartService.findByToken(req.cookies?.[CART_TOKEN_COOKIE]);
    return this.cartService.view(cart, shippingMethod);
  }

  @Public()
  @Post("items")
  async addItem(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: AddCartItemDto,
  ) {
    const user = (req as any).user as AuthUser | undefined;
    let token = req.cookies?.[CART_TOKEN_COOKIE];

    if (!user && !token) {
      token = this.cartService.generateGuestToken();
      res.cookie(CART_TOKEN_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 90 * 24 * 60 * 60 * 1000,
      });
    }

    const cart = await this.cartService.addItem({ token, userId: user?.userId }, dto);
    return this.cartService.view(cart);
  }

  @Public()
  @Patch("items/:itemId")
  async updateItem(
    @Req() req: Request,
    @Param("itemId") itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const cart = await this.resolveCart(req);
    const updated = await this.cartService.updateItemQty(cart, itemId, dto.qty);
    return this.cartService.view(updated);
  }

  @Public()
  @Delete("items/:itemId")
  async removeItem(@Req() req: Request, @Param("itemId") itemId: string) {
    const cart = await this.resolveCart(req);
    const updated = await this.cartService.removeItem(cart, itemId);
    return this.cartService.view(updated);
  }

  @Public()
  @Delete()
  async clear(@Req() req: Request) {
    const cart = await this.resolveCart(req);
    const updated = await this.cartService.clear(cart);
    return this.cartService.view(updated);
  }

  private async resolveCart(req: Request) {
    const user = (req as any).user as AuthUser | undefined;
    const cart = user
      ? await this.cartService.findByUser(user.userId)
      : await this.cartService.findByToken(req.cookies?.[CART_TOKEN_COOKIE]);
    if (!cart) throw new NotFoundException("Cart not found");
    return cart;
  }
}
