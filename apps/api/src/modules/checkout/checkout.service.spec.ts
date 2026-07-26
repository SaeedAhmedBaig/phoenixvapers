import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';

import { AuditService } from '../audit/audit.service';
import { CartService } from '../cart/cart.service';
import { CustomersService } from '../identity/customers.service';
import { OrdersService } from '../orders/orders.service';
import { OrderStatus } from '../orders/schemas/order.schema';
import { PAYMENT_PORT, PspUnavailableError } from '../payments/payments.port';
import { PricingService } from '../pricing/pricing.service';
import { VerificationService } from '../verification/verification.service';
import { CheckoutService } from './checkout.service';

/**
 * [COMPLIANCE] Checkout fail-closed suite (spec §6.3, §7.1, §4.2):
 * unverified accounts never reach payment, provider failures block the
 * sale, a payment failure never loses the basket, and the state machine
 * walks Created → Payment Authorised → Compliance Confirmed → Accepted
 * in exactly that order on success.
 */

const CUSTOMER_ID = new Types.ObjectId().toHexString();

const pricing = new PricingService({
  getOrThrow: (key: string) =>
    ({ VPD_DUTY_MINOR_PER_10ML: 220, VAT_RATE_BP: 2000 })[key],
} as any);

/** A checkout-ready priced cart: 2 × 10ml salts (£14.86 inc). */
const pricedCart = () => ({
  lines: [
    {
      sku: 'PHX-FM-SALT-10',
      quantity: 2,
      purchaseType: 'one-off',
      name: 'Forest Mint Salts',
      brand: 'Phoenix',
      attributes: { strength: '10mg' },
      available: true,
      unit: { netMinor: 399, dutyMinor: 220, vatMinor: 124, totalMinor: 743 },
      line: { netMinor: 798, dutyMinor: 440, vatMinor: 248, totalMinor: 1486 },
    },
  ],
  itemCount: 2,
  totals: { netMinor: 798, dutyMinor: 440, vatMinor: 248, totalMinor: 1486 },
  needsAttention: false,
});

const verifiedCustomer = () => ({
  email: 'verified@example.dev',
  addresses: [
    {
      label: 'Home',
      line1: '1 Test St',
      city: 'Leeds',
      postcode: 'LS1 1AA',
      country: 'GB',
    },
  ],
  ageVerification: {
    evidenceRef: 'mock-av:pass:1',
    verifiedAt: new Date('2026-06-01'),
    expiresAt: new Date('2027-06-01'),
  },
});

const dto = {
  addressIndex: 0,
  deliveryMethodId: 'standard',
  paymentMethodToken: 'pm_card_ok',
};

describe('CheckoutService', () => {
  let service: CheckoutService;
  let cart: {
    requireCheckoutView: jest.Mock;
    clearForCustomer: jest.Mock;
  };
  let customers: { requireById: jest.Mock };
  let verification: { assertSaleAllowed: jest.Mock };
  let orders: { create: jest.Mock; transition: jest.Mock };
  let psp: { authorise: jest.Mock; capture: jest.Mock; refund: jest.Mock };
  let audit: { record: jest.Mock };

  beforeEach(async () => {
    cart = {
      requireCheckoutView: jest.fn().mockResolvedValue(pricedCart()),
      clearForCustomer: jest.fn().mockResolvedValue(undefined),
    };
    customers = {
      requireById: jest.fn().mockResolvedValue(verifiedCustomer()),
    };
    verification = {
      assertSaleAllowed: jest.fn().mockResolvedValue(undefined),
    };
    orders = {
      create: jest.fn().mockResolvedValue({
        id: 'order1',
        orderNumber: 'PHX-10001',
        totals: { totalMinor: 1885 },
      }),
      transition: jest.fn().mockImplementation((_id, _from, to) =>
        Promise.resolve({
          orderNumber: 'PHX-10001',
          status: to,
          toObject: () => ({
            orderNumber: 'PHX-10001',
            status: to,
            createdAt: new Date(),
            lines: [],
            goodsTotals: pricedCart().totals,
            totals: {
              netMinor: 1130,
              dutyMinor: 440,
              vatMinor: 315,
              totalMinor: 1885,
            },
            delivery: {
              methodId: 'standard',
              methodLabel: 'Standard delivery',
              charge: {
                netMinor: 332,
                dutyMinor: 0,
                vatMinor: 67,
                totalMinor: 399,
              },
              address: {
                line1: '1 Test St',
                city: 'Leeds',
                postcode: 'LS1 1AA',
                country: 'GB',
              },
            },
            payment: { status: 'captured' },
            events: [],
          }),
        }),
      ),
    };
    psp = {
      authorise: jest
        .fn()
        .mockResolvedValue({ intentId: 'mockpay_1', status: 'authorised' }),
      capture: jest.fn().mockResolvedValue({ captured: true }),
      refund: jest.fn(),
    };
    audit = { record: jest.fn().mockResolvedValue(undefined) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CheckoutService,
        { provide: CartService, useValue: cart },
        { provide: CustomersService, useValue: customers },
        { provide: VerificationService, useValue: verification },
        { provide: PricingService, useValue: pricing },
        { provide: OrdersService, useValue: orders },
        { provide: AuditService, useValue: audit },
        { provide: PAYMENT_PORT, useValue: psp },
      ],
    }).compile();

    service = moduleRef.get(CheckoutService);
  });

  it('[COMPLIANCE] blocks unverified accounts BEFORE any order or payment', async () => {
    verification.assertSaleAllowed.mockRejectedValue(
      new ForbiddenException(
        'A valid age verification is required before purchase',
      ),
    );

    await expect(service.placeOrder(CUSTOMER_ID, dto)).rejects.toThrow(
      ForbiddenException,
    );

    expect(orders.create).not.toHaveBeenCalled();
    expect(psp.authorise).not.toHaveBeenCalled();
    expect(cart.clearForCustomer).not.toHaveBeenCalled();
  });

  it('[COMPLIANCE] fails closed on PSP outage — order marked failed, basket kept', async () => {
    psp.authorise.mockRejectedValue(new PspUnavailableError());

    await expect(service.placeOrder(CUSTOMER_ID, dto)).rejects.toThrow(
      ServiceUnavailableException,
    );

    expect(orders.transition).toHaveBeenCalledWith(
      'order1',
      OrderStatus.CREATED,
      OrderStatus.PAYMENT_FAILED,
      'system',
      expect.anything(),
    );
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'payment.provider_outage' }),
    );
    expect(cart.clearForCustomer).not.toHaveBeenCalled();
  });

  it('a declined payment never loses the basket (§6.3)', async () => {
    psp.authorise.mockResolvedValue({
      intentId: 'mockpay_2',
      status: 'declined',
      declineReason: 'Your card was declined',
    });

    await expect(service.placeOrder(CUSTOMER_ID, dto)).rejects.toThrow(
      HttpException,
    );

    expect(orders.transition).toHaveBeenCalledWith(
      'order1',
      OrderStatus.CREATED,
      OrderStatus.PAYMENT_FAILED,
      'system',
      expect.anything(),
    );
    expect(psp.capture).not.toHaveBeenCalled();
    expect(cart.clearForCustomer).not.toHaveBeenCalled();
  });

  it('[COMPLIANCE] cancels after authorisation if the AV pass lapsed in between', async () => {
    verification.assertSaleAllowed
      .mockResolvedValueOnce(undefined) // pre-flight passes
      .mockRejectedValueOnce(new ForbiddenException('expired')); // re-check fails

    await expect(service.placeOrder(CUSTOMER_ID, dto)).rejects.toThrow(
      ForbiddenException,
    );

    expect(orders.transition).toHaveBeenCalledWith(
      'order1',
      OrderStatus.PAYMENT_AUTHORISED,
      OrderStatus.CANCELLED,
      'system',
      expect.anything(),
    );
    expect(psp.capture).not.toHaveBeenCalled();
    expect(cart.clearForCustomer).not.toHaveBeenCalled();
  });

  it('rejects a missing saved address before creating anything', async () => {
    await expect(
      service.placeOrder(CUSTOMER_ID, { ...dto, addressIndex: 5 }),
    ).rejects.toThrow(BadRequestException);

    expect(orders.create).not.toHaveBeenCalled();
    expect(psp.authorise).not.toHaveBeenCalled();
  });

  it('walks the §7.1 state machine in order and clears the basket LAST on success', async () => {
    const result = await service.placeOrder(CUSTOMER_ID, dto);

    const path = orders.transition.mock.calls.map(([, from, to]) => [from, to]);
    expect(path).toEqual([
      [OrderStatus.CREATED, OrderStatus.PAYMENT_AUTHORISED],
      [OrderStatus.PAYMENT_AUTHORISED, OrderStatus.COMPLIANCE_CONFIRMED],
      [OrderStatus.COMPLIANCE_CONFIRMED, OrderStatus.ACCEPTED],
    ]);

    // Free-over-£40 not hit: goods £14.86 + standard £3.99 = £18.85 total.
    expect(psp.authorise).toHaveBeenCalledWith(
      expect.objectContaining({ amountMinor: 1885, currency: 'GBP' }),
    );
    expect(psp.capture).toHaveBeenCalledWith('mockpay_1', 1885);
    expect(cart.clearForCustomer).toHaveBeenCalledWith(CUSTOMER_ID);
    expect(result.orderNumber).toBe('PHX-10001');
  });

  it('grants free standard delivery over the £40 goods threshold', async () => {
    const bigCart = pricedCart();
    bigCart.totals = {
      netMinor: 3000,
      dutyMinor: 660,
      vatMinor: 732,
      totalMinor: 4392,
    };
    cart.requireCheckoutView.mockResolvedValue(bigCart);

    await service.placeOrder(CUSTOMER_ID, dto);

    expect(psp.authorise).toHaveBeenCalledWith(
      expect.objectContaining({ amountMinor: 4392 }), // no delivery charge added
    );
  });
});
