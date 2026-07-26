import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { CustomersService } from './customers.service';
import { IdentityController } from './identity.controller';
import { OperatorAdminController } from './operator-admin.controller';
import { JwtStrategy } from './jwt.strategy';
import { OperatorJwtStrategy } from './operator-jwt.strategy';
import { OperatorsService } from './operators.service';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { Operator, OperatorSchema } from './schemas/operator.schema';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './schemas/refresh-token.schema';

/**
 * Identity & Access bounded context (spec §16.2) — customer accounts,
 * credentials, sessions, addresses, consents. Age verification is a
 * SEPARATE context that consumes this module's exported services.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: Operator.name, schema: OperatorSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [IdentityController, OperatorAdminController],
  providers: [
    AuthService,
    CustomersService,
    OperatorsService,
    JwtStrategy,
    OperatorJwtStrategy,
  ],
  // CustomersService and OperatorsService are the ONLY exported surfaces —
  // no other module touches these collections directly (§16.7). Admin
  // modules import OperatorsService (+ OperatorAuthGuard) for staff CRUD.
  exports: [CustomersService, OperatorsService],
})
export class IdentityModule {}
