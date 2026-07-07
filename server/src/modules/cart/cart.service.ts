import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { randomUUID } from "crypto";
import { Cart } from "./schemas/cart.schema";
import { Product } from "../catalogue/schemas/product.schema";
import { PricingService } from "../pricing/pricing.service";
import { ShippingService } from "../shipping/shipping.service";
import { TaxService } from "../tax/tax.service";

export interface CartLineView {
  itemId: string;
  productSlug: string;
  name: string;
  brand: string;
  category: string;
  format: string;
  strength?: string;
  unitPriceMinor: number;
  compareAtMinor?: number;
  qty: number;
  lineTotalMinor: number;
}

export interface CartView {
  cartId?: string;
  items: CartLineView[];
  subtotalMinor: number;
  discountMinor: number;
  appliedPromotions: { code: string; label: string; discountMinor: number }[];
  deliveryMinor: number;
  shippingMethod?: { code: string; label: string; etaLabel: string };
  totalMinor: number;
  freeShippingThresholdMinor: number;
  freeShippingRemainingMinor: number;
  pointsPreview: number;
  vat: { rate: number; netMinor: number; vatMinor: number };
}

const POINTS_PER_POUND = 1;

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    private readonly pricingService: PricingService,
    private readonly shippingService: ShippingService,
    private readonly taxService: TaxService,
  ) {}

  generateGuestToken(): string {
    return randomUUID();
  }

  async findByToken(token: string): Promise<Cart | null> {
    return this.cartModel.findOne({ token });
  }

  async findByUser(userId: string): Promise<Cart | null> {
    return this.cartModel.findOne({ user: userId });
  }

  private async getOrCreate(opts: { token?: string; userId?: string }): Promise<Cart> {
    if (opts.userId) {
      const existing = await this.cartModel.findOne({ user: opts.userId });
      if (existing) return existing;
      return this.cartModel.create({ user: opts.userId, items: [] });
    }
    const token = opts.token ?? this.generateGuestToken();
    const existing = await this.cartModel.findOne({ token });
    if (existing) return existing;
    return this.cartModel.create({ token, items: [] });
  }

  async addItem(
    opts: { token?: string; userId?: string },
    dto: { productSlug: string; strength?: string; qty?: number },
  ): Promise<Cart> {
    const product = await this.productModel.findOne({ slug: dto.productSlug }).lean() as any;
    if (!product) throw new NotFoundException(`Product "${dto.productSlug}" not found`);

    const cart = await this.getOrCreate(opts);
    const qty = dto.qty ?? 1;
    const existing = cart.items.find(
      (item) => item.product.toString() === product._id.toString() && item.strength === dto.strength,
    );
    if (existing) {
      existing.qty += qty;
    } else {
      cart.items.push({ product: product._id as Types.ObjectId, strength: dto.strength, qty } as any);
    }
    await cart.save();
    return cart;
  }

  async updateItemQty(cart: Cart, itemId: string, qty: number): Promise<Cart> {
    if (qty <= 0) {
      cart.items = cart.items.filter((item) => item._id.toString() !== itemId) as any;
    } else {
      const item = cart.items.find((entry) => entry._id.toString() === itemId);
      if (!item) throw new NotFoundException("Cart item not found");
      item.qty = qty;
    }
    await cart.save();
    return cart;
  }

  async removeItem(cart: Cart, itemId: string): Promise<Cart> {
    cart.items = cart.items.filter((item) => item._id.toString() !== itemId) as any;
    await cart.save();
    return cart;
  }

  async clear(cart: Cart): Promise<Cart> {
    cart.items = [] as any;
    await cart.save();
    return cart;
  }

  /** Merges a guest cart's lines into the user's cart on login, then removes the guest cart. */
  async mergeGuestIntoUser(guestToken: string, userId: string): Promise<void> {
    const guestCart = await this.cartModel.findOne({ token: guestToken });
    if (!guestCart || guestCart.items.length === 0) return;

    const userCart = await this.getOrCreate({ userId });
    for (const guestItem of guestCart.items) {
      const existing = userCart.items.find(
        (item) => item.product.toString() === guestItem.product.toString() && item.strength === guestItem.strength,
      );
      if (existing) {
        existing.qty += guestItem.qty;
      } else {
        userCart.items.push(guestItem);
      }
    }
    await userCart.save();
    await this.cartModel.deleteOne({ _id: guestCart._id });
  }

  async view(cart: Cart | null, shippingMethodCode?: string): Promise<CartView> {
    if (!cart || cart.items.length === 0) {
      const shipping = await this.shippingService.calculate(0, shippingMethodCode);
      return {
        cartId: cart?.id,
        items: [],
        subtotalMinor: 0,
        discountMinor: 0,
        appliedPromotions: [],
        deliveryMinor: 0,
        shippingMethod: shipping.method
          ? { code: shipping.method.code, label: shipping.method.label, etaLabel: shipping.method.etaLabel }
          : undefined,
        totalMinor: 0,
        freeShippingThresholdMinor: shipping.method?.freeThresholdMinor ?? 0,
        freeShippingRemainingMinor: shipping.method?.freeThresholdMinor ?? 0,
        pointsPreview: 0,
        vat: { rate: this.taxService.rate, netMinor: 0, vatMinor: 0 },
      };
    }

    const productIds = cart.items.map((item) => item.product);
    const products = (await this.productModel.find({ _id: { $in: productIds } }).lean()) as any[];
    const productMap = new Map<string, any>(products.map((product) => [product._id.toString(), product]));

    const lines: CartLineView[] = [];
    const promoLines: import("../pricing/pricing.service").PricingLineInput[] = [];
    for (const item of cart.items) {
      const product = productMap.get(item.product.toString());
      if (!product) continue;
      lines.push({
        itemId: item._id.toString(),
        productSlug: product.slug,
        name: product.name,
        brand: product.brandName,
        category: product.categorySlug,
        format: product.format,
        strength: item.strength,
        unitPriceMinor: product.priceMinor,
        compareAtMinor: product.compareAtMinor,
        qty: item.qty,
        lineTotalMinor: product.priceMinor * item.qty,
      });
      promoLines.push({
        productId: product._id.toString(),
        brandSlug: product.brandSlug,
        categorySlug: product.categorySlug,
        unitPriceMinor: product.priceMinor,
        qty: item.qty,
      });
    }

    const subtotalMinor = lines.reduce((sum, line) => sum + line.lineTotalMinor, 0);
    const promoResult = await this.pricingService.applyPromotions(promoLines);

    const discountedSubtotal = subtotalMinor - promoResult.discountMinor;
    const shipping = await this.shippingService.calculate(discountedSubtotal, shippingMethodCode);
    const totalMinor = discountedSubtotal + shipping.priceMinor;
    const vat = this.taxService.vatBreakdown(totalMinor);

    return {
      cartId: cart.id,
      items: lines,
      subtotalMinor,
      discountMinor: promoResult.discountMinor,
      appliedPromotions: promoResult.applied,
      deliveryMinor: shipping.priceMinor,
      shippingMethod: shipping.method
        ? { code: shipping.method.code, label: shipping.method.label, etaLabel: shipping.method.etaLabel }
        : undefined,
      totalMinor,
      freeShippingThresholdMinor: shipping.method?.freeThresholdMinor ?? 0,
      freeShippingRemainingMinor: Math.max(0, (shipping.method?.freeThresholdMinor ?? 0) - discountedSubtotal),
      pointsPreview: Math.floor((discountedSubtotal / 100) * POINTS_PER_POUND),
      vat: { rate: vat.rate, netMinor: vat.netMinor, vatMinor: vat.vatMinor },
    };
  }
}
