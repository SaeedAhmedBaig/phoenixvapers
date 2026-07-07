import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Model } from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./schemas/user.schema";
import { LoginDto, RegisterDto } from "./dto/auth.dto";
import { RbacService } from "../rbac/rbac.service";
import { ROLE_NAMES } from "../../common/constants/permissions";
import type { AuthUser } from "../../common/types/auth-user.type";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly rbacService: RbacService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: SafeUser; tokens: TokenPair }> {
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (existing) throw new ConflictException("An account with this email already exists");

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.userModel.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      name: dto.name,
      phone: dto.phone,
      role: ROLE_NAMES.CUSTOMER,
    });

    const tokens = await this.issueTokens(user);
    return { user: toSafeUser(user), tokens };
  }

  async login(dto: LoginDto): Promise<{ user: SafeUser; tokens: TokenPair }> {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (!user || !user.active) throw new UnauthorizedException("Invalid email or password");

    const matches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matches) throw new UnauthorizedException("Invalid email or password");

    const tokens = await this.issueTokens(user);
    return { user: toSafeUser(user), tokens };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: AuthUser;
    try {
      payload = await this.jwt.verifyAsync<AuthUser>(refreshToken, {
        secret: this.config.get<string>("jwt.refreshSecret"),
      });
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    const user = await this.userModel.findById(payload.userId);
    if (!user || !user.active) throw new UnauthorizedException("Account no longer active");
    return this.issueTokens(user);
  }

  async me(userId: string): Promise<SafeUser> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException();
    return toSafeUser(user);
  }

  private async issueTokens(user: User): Promise<TokenPair> {
    const permissions = await this.rbacService.permissionsFor(user.role);
    const payload: AuthUser = {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions,
      brandScope: (user.brandScope ?? []).map((id) => id.toString()),
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>("jwt.accessSecret"),
        expiresIn: this.config.get<string>("jwt.accessTtl") as any,
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>("jwt.refreshSecret"),
        expiresIn: this.config.get<string>("jwt.refreshTtl") as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: string;
  brandScope: string[];
}

function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    brandScope: (user.brandScope ?? []).map((id) => id.toString()),
  };
}
