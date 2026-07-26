import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';

import { CatalogueService } from '../catalogue/catalogue.service';
import { PricingService } from '../pricing/pricing.service';
import { CartService } from './cart.service';
import { Cart } from './schemas/cart.schema';

/**
 * Basket rules under test (spec §6.2): live catalogue validation on add,
 * per-customer limits, guest-token minting, merge-on-login, and the
 * strict revalidated read checkout depends on.
 */

const CUSTOMER_ID = new Types.ObjectId().toHexString();

/** Real pricing maths (pure engine) with the statutory defaults. */
const pricing = new PricingService({
  getOrThrow: (key: string) =>
    ({ VPD_DUTY_MINOR_PER_10ML: 220, VAT_RATE_BP: 2000 })[key],
} as any);

const sellable = (
  sku: string,
  opts: { inStock?: boolean; netPriceMinor?: number } = {},
) => ({
  product: {
    name: `Product ${sku}`,
    slug: sku.toLowerCase(),
    brand: 'Phoenix',
    media: [],
    complianceProfile: {
      dutyClassification: 'vaping-liquid',
      containerVolumeMl: 10,
    },
  },
  variant: {
    sku,
    attributes: {},
    inStockStub: opts.inStock ?? true,
    netPriceMinor: opts.netPriceMinor ?? 399,
  },
});

describe('CartService', () => {
  let service: CartService;
  let model: { findOne: jest.Mock; create: jest.Mock; deleteOne: jest.Mock };
  let catalogue: { resolveSellableVariants: jest.Mock };

  /** In-memory stand-in for a hydrated cart document. */
  function cartDoc(
    lines: unknown[] = [],
    owner: Partial<Record<'customerId' | 'anonymousTokenHash', unknown>> = {},
  ) {
    return {
      ...owner,
      lines,
      save: jest.fn().mockResolvedValue(undefined),
      deleteOne: jest.fn().mockResolvedValue(undefined),
    };
  }

  beforeEach(async () => {
    model = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest
        .fn()
        .mockImplementation((doc) => Promise.resolve(cartDoc(doc.lines, doc))),
      deleteOne: jest.fn().mockResolvedValue(undefined),
    };
    catalogue = {
      resolveSellableVariants: jest.fn().mockResolvedValue(new Map()),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getModelToken(Cart.name), useValue: model },
        { provide: CatalogueService, useValue: catalogue },
        { provide: PricingService, useValue: pricing },
      ],
    }).compile();

    service = moduleRef.get(CartService);
  });

  describe('addLine', () => {
    it('rejects a SKU the catalogue will not sell right now', async () => {
      catalogue.resolveSellableVariants.mockResolvedValue(new Map());

      await expect(
        service.addLine({ customerId: CUSTOMER_ID }, {
          sku: 'PHX-GONE-1',
          quantity: 1,
          purchaseType: 'one-off',
        } as never),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects an out-of-stock variant at add time', async () => {
      catalogue.resolveSellableVariants.mockResolvedValue(
        new Map([['PHX-OOS-1', sellable('PHX-OOS-1', { inStock: false })]]),
      );

      await expect(
        service.addLine({ customerId: CUSTOMER_ID }, {
          sku: 'PHX-OOS-1',
          quantity: 1,
          purchaseType: 'one-off',
        } as never),
      ).rejects.toThrow(ConflictException);
    });

    it('mints a guest token on the first guest write — and only then', async () => {
      catalogue.resolveSellableVariants.mockResolvedValue(
        new Map([['PHX-SALT-1', sellable('PHX-SALT-1')]]),
      );

      const result = await service.addLine({}, {
        sku: 'PHX-SALT-1',
        quantity: 1,
        purchaseType: 'one-off',
      } as never);

      expect(result.cartToken).toMatch(/^[a-f0-9]{64}$/);
      // Only the SHA-256 hash reaches the database.
      const stored = model.create.mock.calls[0][0];
      expect(stored.anonymousTokenHash).toMatch(/^[a-f0-9]{64}$/);
      expect(stored.anonymousTokenHash).not.toBe(result.cartToken);
    });

    it('tops up an existing line and clamps at the line limit (§6.2 limits)', async () => {
      catalogue.resolveSellableVariants.mockResolvedValue(
        new Map([['PHX-SALT-1', sellable('PHX-SALT-1')]]),
      );
      const doc = cartDoc(
        [{ sku: 'PHX-SALT-1', quantity: 8, purchaseType: 'one-off' }],
        { customerId: CUSTOMER_ID },
      );
      model.findOne.mockResolvedValue(doc);

      await service.addLine({ customerId: CUSTOMER_ID }, {
        sku: 'PHX-SALT-1',
        quantity: 5,
        purchaseType: 'one-off',
      } as never);

      expect(doc.lines[0]).toMatchObject({ quantity: 10 }); // 8 + 5 → clamp 10
      expect(doc.save).toHaveBeenCalled();
    });

    it('keeps one-off and subscription lines separate (§6.2)', async () => {
      catalogue.resolveSellableVariants.mockResolvedValue(
        new Map([['PHX-SALT-1', sellable('PHX-SALT-1')]]),
      );
      const doc = cartDoc(
        [{ sku: 'PHX-SALT-1', quantity: 2, purchaseType: 'one-off' }],
        { customerId: CUSTOMER_ID },
      );
      model.findOne.mockResolvedValue(doc);

      await service.addLine({ customerId: CUSTOMER_ID }, {
        sku: 'PHX-SALT-1',
        quantity: 1,
        purchaseType: 'subscription',
      } as never);

      expect(doc.lines).toHaveLength(2);
    });
  });

  describe('pricing of the basket view', () => {
    it('prices lines with the real engine and flags dead lines honestly', async () => {
      const doc = cartDoc(
        [
          { sku: 'PHX-SALT-1', quantity: 2, purchaseType: 'one-off' },
          { sku: 'PHX-DEAD-1', quantity: 1, purchaseType: 'one-off' },
        ],
        { customerId: CUSTOMER_ID },
      );
      model.findOne.mockResolvedValue(doc);
      catalogue.resolveSellableVariants.mockResolvedValue(
        new Map([['PHX-SALT-1', sellable('PHX-SALT-1')]]),
      );

      const { cart } = await service.view({ customerId: CUSTOMER_ID });

      // 2 × (399 net + 220 duty), VAT on 1238 = 247.6 → 248
      expect(cart.totals).toEqual({
        netMinor: 798,
        dutyMinor: 440,
        vatMinor: 248,
        totalMinor: 1486,
      });
      expect(cart.itemCount).toBe(2);
      expect(cart.needsAttention).toBe(true);
      expect(cart.lines.find((l) => l.sku === 'PHX-DEAD-1')).toMatchObject({
        available: false,
        issue: 'no-longer-available',
      });
    });
  });

  describe('merge on sign-in', () => {
    it('folds guest lines into the customer cart and deletes the guest cart', async () => {
      const guest = cartDoc(
        [{ sku: 'PHX-SALT-1', quantity: 2, purchaseType: 'one-off' }],
        { anonymousTokenHash: 'x' },
      );
      const mine = cartDoc(
        [{ sku: 'PHX-SALT-1', quantity: 9, purchaseType: 'one-off' }],
        { customerId: CUSTOMER_ID },
      );
      // First lookup: guest by token hash; second: customer cart.
      model.findOne.mockResolvedValueOnce(guest).mockResolvedValue(mine);
      catalogue.resolveSellableVariants.mockResolvedValue(
        new Map([['PHX-SALT-1', sellable('PHX-SALT-1')]]),
      );

      await service.merge(CUSTOMER_ID, 'a'.repeat(64));

      expect(mine.lines[0]).toMatchObject({ quantity: 10 }); // 9 + 2 → clamp
      expect(guest.deleteOne).toHaveBeenCalled();
    });

    it('treats a missing guest cart as success (login flow calls unconditionally)', async () => {
      model.findOne.mockResolvedValue(null);

      const { cart } = await service.merge(CUSTOMER_ID, 'a'.repeat(64));

      expect(cart.lines).toEqual([]);
    });
  });

  describe('requireCheckoutView — the §6.2 revalidation checkout relies on', () => {
    it('rejects an empty basket', async () => {
      model.findOne.mockResolvedValue(null);

      await expect(service.requireCheckoutView(CUSTOMER_ID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('fails closed when a line is no longer purchasable', async () => {
      const doc = cartDoc(
        [{ sku: 'PHX-DEAD-1', quantity: 1, purchaseType: 'one-off' }],
        { customerId: CUSTOMER_ID },
      );
      model.findOne.mockResolvedValue(doc);
      catalogue.resolveSellableVariants.mockResolvedValue(new Map());

      await expect(service.requireCheckoutView(CUSTOMER_ID)).rejects.toThrow(
        ConflictException,
      );
    });

    it('returns the priced basket when everything is purchasable', async () => {
      const doc = cartDoc(
        [{ sku: 'PHX-SALT-1', quantity: 1, purchaseType: 'one-off' }],
        { customerId: CUSTOMER_ID },
      );
      model.findOne.mockResolvedValue(doc);
      catalogue.resolveSellableVariants.mockResolvedValue(
        new Map([['PHX-SALT-1', sellable('PHX-SALT-1')]]),
      );

      const cart = await service.requireCheckoutView(CUSTOMER_ID);

      expect(cart.itemCount).toBe(1);
      expect(cart.totals.totalMinor).toBe(743);
    });
  });
});
