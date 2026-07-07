import { Controller, Get } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { ShippingService } from "./shipping.service";

@Controller("shipping/methods")
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Public()
  @Get()
  findAll() {
    return this.shippingService.findActive();
  }
}
