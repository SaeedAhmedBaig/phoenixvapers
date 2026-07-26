import { createHash, randomBytes } from 'node:crypto';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CatalogueService } from '../catalogue/catalogue.service';
import { PricingService } from '../pricing/pricing.service';
import { toPricedCart, type PricedCart } from './cart.serializer';
import {
  MAX_CART_LINES,
  MAX_LINE_QUANTITY,
  type AddLineDto,
} from './dto/cart.dto';
import { Cart, CartDocument, type CartLine } from './schemas/cart.schema';

/**
 * Who a cart request is for: a signed-in customer, a guest presenting a
 * cart token, or a first-time guest (neither — a token is minted on the
 * first write). Resolved by the controller, trusted here.
 */
export interface CartIdentity {
  customerId?: string;
  cartToken?: string;
}

/** A cart view plus the freshly minted guest token, when one was created. */
export interface CartResult {
  cart: PricedCart;
  /** Present ONLY on the response that created a guest cart — the BFF
   *  stores it in an httpOnly cookie and it is never retrievable again. */
  cartToken?: string;
}

const EMPTY_CART: PricedCart = {
  lines: [],
  itemCount: 0,
  totals: { netMinor: 0, dutyMinor: 0, vatMinor: 0, totalMinor: 0 },
  needsAttention: false,
};

/**
 * Cart bounded context (spec §6.2) — the persistent basket.
 *
 * Owns the carts collection. Product truth stays in Catalogue (resolved
 * per read), money truth stays in Pricing — this module only owns WHICH
 * lines a shopper is holding.
 */
@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly model: Model<Cart>,
    private readonly catalogue: CatalogueService,
    private readonly pricing: PricingService,
  ) {}

  /** Current priced basket; an unknown identity is just an empty basket. */
  async view(identity: CartIdentity): Promise<CartResult> {
    const cart = await this.findCart(identity);
    return { cart: cart ? await this.price(cart) : EMPTY_CART };
  }

  /**
   * Add units of a SKU (or top up an existing line). The SKU must resolve
   * to a live sellable variant with stock — the basket never accepts a
   * line the catalogue would not sell right now (§6.2).
   */
  async addLine(identity: CartIdentity, dto: AddLineDto): Promise<CartResult> {
    const resolved = await this.catalogue.resolveSellableVariants([dto.sku]);
    const hit = resolved.get(dto.sku);
    if (!hit) {
      throw new NotFoundException('This product is not available');
    }
    if (!hit.variant.inStockStub) {
      throw new ConflictException('This product is out of stock');
    }

    const { cart, mintedToken } = await this.findOrCreateCart(identity);

    const line = cart.lines.find(
      (l) => l.sku === dto.sku && l.purchaseType === dto.purchaseType,
    );
    if (line) {
      line.quantity = Math.min(line.quantity + dto.quantity, MAX_LINE_QUANTITY);
    } else {
      if (cart.lines.length >= MAX_CART_LINES) {
        throw new ConflictException('Basket line limit reached');
      }
      cart.lines.push({
        sku: dto.sku,
        quantity: dto.quantity,
        purchaseType: dto.purchaseType,
        addedAt: new Date(),
      });
    }

    await cart.save();
    return { cart: await this.price(cart), cartToken: mintedToken };
  }

  async updateLine(
    identity: CartIdentity,
    sku: string,
    quantity: number,
  ): Promise<CartResult> {
    const cart = await this.requireCart(identity);

    const line = cart.lines.find((l) => l.sku === sku);
    if (!line) throw new NotFoundException('Line not in basket');

    line.quantity = quantity;
    await cart.save();
    return { cart: await this.price(cart) };
  }

  async removeLine(identity: CartIdentity, sku: string): Promise<CartResult> {
    const cart = await this.requireCart(identity);

    const before = cart.lines.length;
    cart.lines = cart.lines.filter((l) => l.sku !== sku);
    if (cart.lines.length === before) {
      throw new NotFoundException('Line not in basket');
    }

    await cart.save();
    return { cart: await this.price(cart) };
  }

  /**
   * Fold a guest cart into the signed-in customer's cart (called by the
   * storefront right after login/registration). Quantities are summed and
   * clamped to the line limit; the guest cart is deleted so the token
   * dies with it.
   */
  async merge(customerId: string, cartToken: string): Promise<CartResult> {
    const guest = await this.model.findOne({
      anonymousTokenHash: hashToken(cartToken),
    });
    // Nothing to merge is success, not an error — the login flow calls
    // this unconditionally.
    if (!guest) return this.view({ customerId });

    const { cart } = await this.findOrCreateCart({ customerId });

    for (const guestLine of guest.lines) {
      const line = cart.lines.find(
        (l) =>
          l.sku === guestLine.sku && l.purchaseType === guestLine.purchaseType,
      );
      if (line) {
        line.quantity = Math.min(
          line.quantity + guestLine.quantity,
          MAX_LINE_QUANTITY,
        );
      } else if (cart.lines.length < MAX_CART_LINES) {
        cart.lines.push(guestLine);
      }
    }

    await cart.save();
    await guest.deleteOne();
    return { cart: await this.price(cart) };
  }

  /**
   * Checkout's strict read [COMPLIANCE-adjacent]: the basket revalidated
   * at the moment of purchase (§6.2). Throws 409 if anything is no longer
   * purchasable — checkout never silently drops a line the customer
   * believes they are buying.
   */
  async requireCheckoutView(customerId: string): Promise<PricedCart> {
    const cart = await this.findCart({ customerId });
    const priced = cart ? await this.price(cart) : EMPTY_CART;

    if (priced.lines.length === 0) {
      throw new BadRequestException('Basket is empty');
    }
    if (priced.needsAttention) {
      throw new ConflictException(
        'Some basket items are no longer available — review your basket',
      );
    }
    return priced;
  }

  /** Basket survives payment failure; it clears only after order creation. */
  async clearForCustomer(customerId: string): Promise<void> {
    await this.model.deleteOne({ customerId: new Types.ObjectId(customerId) });
  }

  /* ─────────────────────────── internals ─────────────────────────── */

  private async price(cart: CartDocument): Promise<PricedCart> {
    const resolved = await this.catalogue.resolveSellableVariants(
      cart.lines.map((l) => l.sku),
    );
    return toPricedCart(cart.lines, resolved, this.pricing);
  }

  private async findCart(identity: CartIdentity): Promise<CartDocument | null> {
    if (identity.customerId) {
      return this.model.findOne({
        customerId: new Types.ObjectId(identity.customerId),
      });
    }
    if (identity.cartToken) {
      return this.model.findOne({
        anonymousTokenHash: hashToken(identity.cartToken),
      });
    }
    return null;
  }

  private async requireCart(identity: CartIdentity): Promise<CartDocument> {
    const cart = await this.findCart(identity);
    if (!cart) throw new NotFoundException('Basket not found');
    return cart;
  }

  private async findOrCreateCart(
    identity: CartIdentity,
  ): Promise<{ cart: CartDocument; mintedToken?: string }> {
    const existing = await this.findCart(identity);
    if (existing) return { cart: existing };

    if (identity.customerId) {
      const cart = await this.model.create({
        customerId: new Types.ObjectId(identity.customerId),
        lines: [],
      });
      return { cart };
    }

    // First guest write: mint an opaque bearer token; only its hash is
    // stored (like refresh tokens — DB possession never grants a cart).
    const token = randomBytes(32).toString('hex');
    const cart = await this.model.create({
      anonymousTokenHash: hashToken(token),
      lines: [],
    });
    return { cart, mintedToken: token };
  }
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
