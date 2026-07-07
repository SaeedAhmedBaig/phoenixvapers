import { Controller, Get } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { TaxService } from "./tax.service";

@Controller("tax")
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Public()
  @Get("vat-rate")
  vatRate() {
    return { rate: this.taxService.rate };
  }
}
