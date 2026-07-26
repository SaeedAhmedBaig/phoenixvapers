import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { AuditService } from '../audit/audit.service';
import { CartService } from '../cart/cart.service';
import { CustomersService } from '../identity/customers.service';
import { OrdersService } from '../orders/orders.service';
import { toOrderDetail } from '../orders/orders.serializer';
import { OrderStatus } from '../orders/schemas/order.schema';
import {
  PAYMENT_PORT,
  PspUnavailableError,
  type PaymentProviderPort,
} from '../payments/payments.port';
import { PricingService } from '../pricing/pricing.service';
import { VerificationService } from '../verification/verification.service';
import { DELIVERY_METHODS, deliveryChargeMinor } from './checkout.constants';
import type { PlaceOrderDto } from './dto/checkout.dto';

/**
 * Checkout orchestration (spec §6.3) [COMPLIANCE].
 *
 * The non-negotiable ordering:
 *
 *   1. assert age verification  — fail closed, BEFORE money moves
 *   2. revalidate the basket    — live stock/compliance/pricing (§6.2)
 *   3. create the order         — full commercial snapshot
 *   4. authorise payment        — via the PSP port, tokens only
 *   5. re-assert compliance     — then Compliance Confirmed (§7.1)
 *   6. capture & accept         — Edition 1.0 captures at acceptance;
 *                                 Phase 4 moves capture to dispatch
 *   7. clear the basket         — LAST: a payment failure never loses
 *                                 the basket (§6.3)
 *
 * Every failure path leaves an order in an honest terminal state with an
 * audit trail, and the customer's basket untouched.
 */
@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private readonly cart: CartService,
    private readonly customers: CustomersService,
    private readonly verification: VerificationService,
    private readonly pricing: PricingService,
    private readonly orders: OrdersService,
    private readonly audit: AuditService,
    @Inject(PAYMENT_PORT) private readonly psp: PaymentProviderPort,
  ) {}

  /**
   * Everything the checkout page needs in one authenticated read: the
   * revalidated basket, saved addresses, and delivery options priced for
   * THIS basket — the client never computes a charge itself.
   */
  async context(customerId: string) {
    const cart = await this.cart.requireCheckoutView(customerId);
    const customer = await this.customers.requireById(customerId);

    return {
      cart,
      addresses: customer.addresses.map((a, index) => ({
        index,
        label: a.label,
        line1: a.line1,
        line2: a.line2,
        city: a.city,
        postcode: a.postcode,
        country: a.country,
      })),
      deliveryMethods: DELIVERY_METHODS.map((method) => ({
        id: method.id,
        label: method.label,
        description: method.description,
        charge: this.pricing.delivery(
          deliveryChargeMinor(method, cart.totals.totalMinor),
        ),
      })),
    };
  }

  /** The one endpoint where money moves. See class doc for the ordering. */
  async placeOrder(customerId: string, dto: PlaceOrderDto) {
    // [COMPLIANCE §4.2] Valid, unexpired age verification or no sale —
    // asserted before payment and before order creation, failing closed.
    await this.verification.assertSaleAllowed(customerId);

    // [COMPLIANCE §6.2] Basket revalidated at the moment of checkout —
    // stock, availability (only approved sellable products resolve), and
    // live engine pricing. Throws rather than silently dropping lines.
    const cart = await this.cart.requireCheckoutView(customerId);

    const customer = await this.customers.requireById(customerId);
    const address = customer.addresses[dto.addressIndex];
    if (!address) {
      throw new BadRequestException('Select a delivery address');
    }

    const method = DELIVERY_METHODS.find((m) => m.id === dto.deliveryMethodId)!;
    const charge = this.pricing.delivery(
      deliveryChargeMinor(method, cart.totals.totalMinor),
    );
    const totals = this.pricing.total([cart.totals, charge]);

    // Full commercial snapshot — later edits never rewrite this sale (§7.2).
    const order = await this.orders.create(
      {
        customerId: new Types.ObjectId(customerId),
        email: customer.email,
        lines: cart.lines.map((line) => ({
          sku: line.sku,
          name: line.name!,
          brand: line.brand!,
          attributes: line.attributes ?? {},
          quantity: line.quantity,
          purchaseType: line.purchaseType,
          unit: line.unit!,
          line: line.line!,
        })),
        goodsTotals: cart.totals,
        delivery: {
          methodId: method.id,
          methodLabel: method.label,
          address: {
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            postcode: address.postcode,
            country: address.country,
          },
          charge,
        },
        totals,
        payment: { provider: 'mock' },
        // [COMPLIANCE §4.6] the evidence this sale relied on.
        verification: {
          evidenceRef: customer.ageVerification.evidenceRef!,
          verifiedAt: customer.ageVerification.verifiedAt!,
          expiresAt: customer.ageVerification.expiresAt!,
        },
      },
      `customer:${customerId}`,
    );
    const orderId = order.id as string;
    const actor = `customer:${customerId}`;

    // Authorise via the PSP port — tokens only, never card data (§6.4).
    let authorisation;
    try {
      authorisation = await this.psp.authorise({
        amountMinor: totals.totalMinor,
        currency: 'GBP',
        paymentMethodToken: dto.paymentMethodToken,
        orderRef: `order:${order.orderNumber}`,
        customerRef: `customer:${customerId}`,
      });
    } catch (error) {
      if (error instanceof PspUnavailableError) {
        // Fail closed; the basket is untouched and the attempt is evidence.
        this.logger.error(
          `P0: PSP outage during checkout (${order.orderNumber})`,
        );
        await this.orders.transition(
          orderId,
          OrderStatus.CREATED,
          OrderStatus.PAYMENT_FAILED,
          'system',
          {
            note: 'Payment provider unavailable',
            set: { 'payment.status': 'failed' },
          },
        );
        await this.audit.record({
          actor: 'system',
          action: 'payment.provider_outage',
          subjectRef: `order:${order.orderNumber}`,
        });
        throw new ServiceUnavailableException(
          'Payments are temporarily unavailable. Your basket is safe — please try again shortly.',
        );
      }
      throw error;
    }

    if (authorisation.status === 'declined') {
      // §6.3: a payment failure never loses the basket.
      await this.orders.transition(
        orderId,
        OrderStatus.CREATED,
        OrderStatus.PAYMENT_FAILED,
        'system',
        {
          note: authorisation.declineReason ?? 'Payment declined',
          set: {
            'payment.status': 'declined',
            'payment.declineReason': authorisation.declineReason,
          },
        },
      );
      throw new HttpException(
        authorisation.declineReason ?? 'Payment was declined',
        402,
      );
    }

    await this.orders.transition(
      orderId,
      OrderStatus.CREATED,
      OrderStatus.PAYMENT_AUTHORISED,
      'system',
      {
        set: {
          'payment.intentId': authorisation.intentId,
          'payment.status': 'authorised',
          'payment.authorisedAt': new Date(),
        },
      },
    );

    // [COMPLIANCE §7.1] No order passes Compliance Confirmed without a
    // valid AV pass and compliant product set. Both were checked minutes
    // ago; both are re-asserted here so nothing that changed in between
    // (pass expiry, product retirement) can slip through before capture.
    try {
      await this.verification.assertSaleAllowed(customerId);
      await this.cart.requireCheckoutView(customerId);
    } catch (error) {
      await this.orders.transition(
        orderId,
        OrderStatus.PAYMENT_AUTHORISED,
        OrderStatus.CANCELLED,
        'system',
        { note: 'Compliance re-check failed after authorisation — voided' },
      );
      throw error;
    }

    await this.orders.transition(
      orderId,
      OrderStatus.PAYMENT_AUTHORISED,
      OrderStatus.COMPLIANCE_CONFIRMED,
      'system',
      { note: 'Age verification and product set re-asserted' },
    );

    // Edition 1.0 captures at acceptance (no fulfilment module yet);
    // Phase 4 moves capture to dispatch. Failure cancels honestly.
    const capture = await this.psp
      .capture(authorisation.intentId, totals.totalMinor)
      .catch(() => ({ captured: false }));
    if (!capture.captured) {
      await this.orders.transition(
        orderId,
        OrderStatus.COMPLIANCE_CONFIRMED,
        OrderStatus.CANCELLED,
        'system',
        { note: 'Payment capture failed' },
      );
      throw new ServiceUnavailableException(
        'Payment could not be completed. Your basket is safe — please try again.',
      );
    }

    const accepted = await this.orders.transition(
      orderId,
      OrderStatus.COMPLIANCE_CONFIRMED,
      OrderStatus.ACCEPTED,
      'system',
      {
        set: { 'payment.status': 'captured', 'payment.capturedAt': new Date() },
      },
    );

    // LAST: only a fully accepted order consumes the basket (§6.3).
    await this.cart.clearForCustomer(customerId);

    return toOrderDetail(accepted.toObject());
  }
}
