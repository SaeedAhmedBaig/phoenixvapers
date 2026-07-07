import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Order } from "./schemas/order.schema";
import { CreateOrderDto } from "./dto/checkout.dto";
import { OrdersService } from "./orders.service";
import { CartService } from "../cart/cart.service";
import { ComplianceService } from "../compliance/compliance.service";
import { InventoryService } from "../inventory/inventory.service";
import { PaymentsService } from "../payments/payments.service";
import { LoyaltyService } from "../loyalty/loyalty.service";
import { NotificationsService } from "../notifications/notifications.service";

export interface CheckoutResult {
  order: Order;
  clientSecret: string | null;
}

@Injectable()
export class CheckoutService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    private readonly ordersService: OrdersService,
    private readonly cartService: CartService,
    private readonly complianceService: ComplianceService,
    private readonly inventoryService: InventoryService,
    private readonly paymentsService: PaymentsService,
    private readonly loyaltyService: LoyaltyService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createOrder(opts: { token?: string; userId?: string }, dto: CreateOrderDto): Promise<CheckoutResult> {
    const cart = opts.userId
      ? await this.cartService.findByUser(opts.userId)
      : await this.cartService.findByToken(opts.token ?? "");

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException("Your cart is empty");
    }

    // Zero technical pathway to checkout without a passed age verification.
    const subjectKey = opts.userId ?? dto.ageVerificationSubjectKey;
    if (!subjectKey) throw new BadRequestException("Age verification is required before checkout can complete");
    await this.complianceService.assertAgeVerified(subjectKey);

    // Prices, discounts and stock are always recomputed server-side — the client's
    // view of the cart is never trusted as the source of truth for money.
    const cartView = await this.cartService.view(cart, dto.shippingMethodCode);

    let loyaltyDiscountMinor = 0;
    if (opts.userId && dto.redeemPoints) {
      const redemption = await this.loyaltyService.redeem(opts.userId, dto.redeemPoints);
      loyaltyDiscountMinor = redemption.discountMinor;
    }

    const totalMinor = Math.max(0, cartView.totalMinor - loyaltyDiscountMinor);

    const reserved: { productId: string; qty: number }[] = [];
    try {
      for (const line of cart.items) {
        const productId = line.product.toString();
        await this.inventoryService.reserve(productId, line.qty);
        reserved.push({ productId, qty: line.qty });
      }
    } catch (error) {
      for (const entry of reserved) await this.inventoryService.release(entry.productId, entry.qty);
      throw error;
    }

    const orderNumber = await this.ordersService.nextOrderNumber();
    const paymentIntent = await this.paymentsService.createPaymentIntent(totalMinor, orderNumber);

    const order = await this.orderModel.create({
      orderNumber,
      user: opts.userId,
      email: dto.email,
      items: cart.items.map((item, index) => ({
        product: item.product,
        name: cartView.items[index]?.name ?? "",
        brand: cartView.items[index]?.brand ?? "",
        strength: item.strength,
        unitPriceMinor: cartView.items[index]?.unitPriceMinor ?? 0,
        qty: item.qty,
        lineTotalMinor: cartView.items[index]?.lineTotalMinor ?? 0,
      })),
      address: dto.address,
      shippingMethodCode: dto.shippingMethodCode,
      subtotalMinor: cartView.subtotalMinor,
      discountMinor: cartView.discountMinor,
      loyaltyDiscountMinor,
      deliveryMinor: cartView.deliveryMinor,
      totalMinor,
      appliedPromotions: cartView.appliedPromotions,
      ageVerified: true,
      status: paymentIntent.status === "succeeded" ? "paid" : "pending_payment",
      paymentProvider: this.paymentsService.usingMockProvider ? "mock" : "stripe",
      paymentIntentId: paymentIntent.id,
      paymentStatus: paymentIntent.status,
    });

    if (order.status === "paid") {
      await this.finalisePaidOrder(order);
    }

    await this.cartService.clear(cart);

    return { order, clientSecret: paymentIntent.clientSecret };
  }

  private async finalisePaidOrder(order: Order): Promise<void> {
    for (const line of order.items) {
      await this.inventoryService.commit(line.product.toString(), line.qty);
    }

    if (order.user) {
      const discountedSubtotal = order.subtotalMinor - order.discountMinor - order.loyaltyDiscountMinor;
      await this.loyaltyService.earnForOrder(order.user.toString(), order.id, discountedSubtotal);
    }

    await this.notificationsService.sendOrderConfirmation({
      userId: order.user?.toString(),
      email: order.email,
      orderNumber: order.orderNumber,
      totalMinor: order.totalMinor,
    });
  }
}
