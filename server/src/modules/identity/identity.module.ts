import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { User, UserSchema } from "./schemas/user.schema";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { RbacModule } from "../rbac/rbac.module";
import { CartModule } from "../cart/cart.module";
import { LoyaltyModule } from "../loyalty/loyalty.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("jwt.accessSecret"),
      }),
    }),
    RbacModule,
    CartModule,
    LoyaltyModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule, MongooseModule],
})
export class IdentityModule {}
