import { Module } from "@nestjs/common";
import { ReportingService } from "./reporting.service";
import { ReportingController } from "./reporting.controller";
import { CheckoutModule } from "../checkout/checkout.module";

@Module({
  imports: [CheckoutModule],
  controllers: [ReportingController],
  providers: [ReportingService],
})
export class ReportingModule {}
