import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { PERMISSIONS } from "../../common/constants/permissions";
import { ReportingService } from "./reporting.service";

@Controller("reporting")
@UseGuards(PermissionsGuard)
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get("sales-by-day")
  @Permissions(PERMISSIONS.REPORTING_READ)
  salesByDay(@Query("from") from?: string, @Query("to") to?: string) {
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from ? new Date(from) : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    return this.reportingService.salesByDay(fromDate, toDate);
  }

  @Get("top-products")
  @Permissions(PERMISSIONS.REPORTING_READ)
  topProducts(@Query("limit") limit?: string) {
    return this.reportingService.topProducts(limit ? parseInt(limit, 10) : 10);
  }
}
