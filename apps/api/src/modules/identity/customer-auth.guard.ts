import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Guard for customer-authenticated routes (401 on any failure). */
@Injectable()
export class CustomerAuthGuard extends AuthGuard('customer-jwt') {}
