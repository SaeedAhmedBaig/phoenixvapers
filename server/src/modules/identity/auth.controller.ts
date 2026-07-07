import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request, Response } from "express";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { crossSiteCookieOptions } from "../../common/utils/cookie.util";
import type { AuthUser } from "../../common/types/auth-user.type";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./dto/auth.dto";
import { CartService } from "../cart/cart.service";
import { CART_TOKEN_COOKIE } from "../cart/cart.controller";
import { LoyaltyService } from "../loyalty/loyalty.service";

const REFRESH_COOKIE = "pv_refresh_token";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
    private readonly cartService: CartService,
    private readonly loyaltyService: LoyaltyService,
  ) {}

  @Public()
  @Post("register")
  async register(@Body() dto: RegisterDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.authService.register(dto);
    this.setRefreshCookie(res, tokens.refreshToken);
    await this.mergeGuestCart(req, res, user.id);
    await this.loyaltyService.grantRegistrationBonus(user.id);
    return { user, accessToken: tokens.accessToken };
  }

  @Public()
  @Post("login")
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.authService.login(dto);
    this.setRefreshCookie(res, tokens.refreshToken);
    await this.mergeGuestCart(req, res, user.id);
    return { user, accessToken: tokens.accessToken };
  }

  @Public()
  @Post("refresh")
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) throw new UnauthorizedException("Missing refresh token");
    const tokens = await this.authService.refresh(token);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post("logout")
  @Public()
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(REFRESH_COOKIE);
    return { success: true };
  }

  @Get("me")
  me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.userId);
  }

  private async mergeGuestCart(req: Request, res: Response, userId: string) {
    const guestToken = req.cookies?.[CART_TOKEN_COOKIE];
    if (!guestToken) return;
    await this.cartService.mergeGuestIntoUser(guestToken, userId);
    res.clearCookie(CART_TOKEN_COOKIE);
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      ...crossSiteCookieOptions(),
      path: "/api/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
