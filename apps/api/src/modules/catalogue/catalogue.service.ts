import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, trusted } from 'mongoose';

import { Operator } from '../../common/auth/roles';
import { AuditService } from '../audit/audit.service';
import { PricingService } from '../pricing/pricing.service';
import { ProductStatus } from './catalogue.constants';
import {
  complianceProfileSchema,
  AdminListQuery,
  ComplianceProfileDto,
  CreateProductDto,
  ListProductsQuery,
  UpdateProductDto,
} from './dto/product.dto';
import { Product, ProductDocument } from './schemas/product.schema';
import { slugify } from './slug.util';
import {
  toProductCard,
  toProductDetail,
  type ProductCard,
  type ProductDetail,
} from './serializers/product.serializer';

/** PLP price buckets over the variant NET price list (integer pence). */
const PRICE_BUCKETS: Record<string, { min: number; max: number }> = {
  'under-5': { min: 0, max: 499 },
  '5-10': { min: 500, max: 999 },
  '10-20': { min: 1000, max: 1999 },
  'over-20': { min: 2000, max: 10_000_000 },
};

/**
 * Catalogue bounded context (spec §16.2).
 *
 * Owns the products collection and its listing lifecycle:
 *   draft → review → (compliance approval) → sellable → retired
 *
 * Segregation of duties is enforced HERE, not in the UI (spec §3.2):
 * merchandiser methods never touch complianceProfile; compliance methods
 * never touch commerce fields. State transitions use atomic
 * findOneAndUpdate preconditions so two operators racing cannot corrupt
 * the lifecycle. Every mutation is audited (spec §4.6).
 */
@Injectable()
export class CatalogueService {
  constructor(
    @InjectModel(Product.name) private readonly model: Model<Product>,
    private readonly audit: AuditService,
    private readonly pricing: PricingService,
  ) {}

  /* ────────────────────── merchandiser operations ─────────────────────── */

  async createDraft(dto: CreateProductDto, operator: Operator) {
    const slug = await this.uniqueSlug(slugify(dto.name));

    const created = await this.model.create({
      ...dto,
      slug,
      status: ProductStatus.DRAFT,
      complianceProfile: {}, // always starts empty — officer fills it in
    });

    await this.audit.record({
      actor: operator.actorId,
      action: 'catalogue.product.created',
      subjectRef: `product:${created.id}`,
      after: { name: dto.name, slug, category: dto.category },
    });

    return this.requireById(created.id);
  }

  /**
   * Merchandiser edit — drafts only. Products under review are frozen so
   * the Compliance Officer reviews exactly what was submitted; sellable
   * products change through retire → new draft (Phase 1 policy).
   */
  async updateDraft(id: string, dto: UpdateProductDto, operator: Operator) {
    // $set with dotted-free top-level keys from a Zod-stripped DTO: the
    // shape is fully whitelisted, so operator input can never reach
    // complianceProfile or status.
    const updated = await this.model.findOneAndUpdate(
      { _id: id, status: ProductStatus.DRAFT },
      { $set: { ...dto } },
      { new: true, runValidators: true },
    );

    if (!updated) {
      await this.explainTransitionFailure(id, [ProductStatus.DRAFT]);
    }

    await this.audit.record({
      actor: operator.actorId,
      action: 'catalogue.product.updated',
      subjectRef: `product:${id}`,
      after: { fields: Object.keys(dto) },
    });

    return updated;
  }

  async submitForReview(id: string, operator: Operator) {
    const product = await this.requireById(id);

    // Minimum submission quality — reviewers should never see empty shells.
    if (product.variants.length === 0 || product.media.length === 0) {
      throw new ConflictException(
        'A product needs at least one variant and one image before review',
      );
    }

    return this.transition(
      id,
      ProductStatus.DRAFT,
      ProductStatus.REVIEW,
      'catalogue.product.submitted_for_review',
      operator,
    );
  }

  /**
   * Publish: review → sellable, permitted to a merchandiser ONLY because
   * the gate is the approved, locked compliance profile — which only a
   * Compliance Officer can produce. [COMPLIANCE] The precondition is part
   * of the atomic query: no approved profile, no publish, no race.
   */
  async publish(id: string, operator: Operator) {
    // `trusted()` marks server-built operator clauses as safe for the
    // global sanitizeFilter — user input never reaches these operators.
    const published = await this.model.findOneAndUpdate(
      {
        _id: id,
        status: ProductStatus.REVIEW,
        'complianceProfile.locked': true,
        'complianceProfile.approvedAt': trusted({ $exists: true }),
      },
      { $set: { status: ProductStatus.SELLABLE } },
      { new: true },
    );

    if (!published) {
      const product = await this.requireById(id);
      if (product.status !== ProductStatus.REVIEW) {
        throw new ConflictException(
          `Cannot publish from status "${product.status}"`,
        );
      }
      throw new ConflictException(
        'Compliance profile must be approved and locked before publishing',
      );
    }

    await this.audit.record({
      actor: operator.actorId,
      action: 'catalogue.product.published',
      subjectRef: `product:${id}`,
      after: { status: ProductStatus.SELLABLE },
    });

    return published;
  }

  async retire(id: string, operator: Operator) {
    return this.transition(
      id,
      ProductStatus.SELLABLE,
      ProductStatus.RETIRED,
      'catalogue.product.retired',
      operator,
    );
  }

  /* ────────────────── compliance officer operations ──────────────────── */

  /**
   * [COMPLIANCE] Set/replace the compliance profile. Any change clears a
   * previous approval — an approved profile is immutable-except-by-
   * re-approval, so an edited product can never keep a stale approval.
   */
  async updateComplianceProfile(
    id: string,
    dto: ComplianceProfileDto,
    operator: Operator,
  ) {
    const product = await this.requireById(id);

    if (product.status === ProductStatus.RETIRED) {
      throw new ConflictException('Retired products cannot be edited');
    }

    const before = product.complianceProfile;

    const updated = await this.model.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          complianceProfile: {
            ...dto,
            approvedBy: undefined,
            approvedAt: undefined,
            locked: false,
          },
          // A sellable product whose compliance data changed drops back to
          // review — it is non-purchasable until re-approved (spec §4.3).
          ...(product.status === ProductStatus.SELLABLE
            ? { status: ProductStatus.REVIEW }
            : {}),
        },
      },
      { new: true, runValidators: true },
    );

    await this.audit.record({
      actor: operator.actorId,
      action: 'compliance.profile.updated',
      subjectRef: `product:${id}`,
      before: { ...before },
      after: { ...dto, locked: false },
    });

    return updated;
  }

  /**
   * [COMPLIANCE] Approve and lock the profile. The stored profile is
   * re-validated at approval time (defence in depth — approval never
   * trusts that the write path validated).
   */
  async approveCompliance(id: string, operator: Operator) {
    const product = await this.requireById(id);

    if (product.status !== ProductStatus.REVIEW) {
      throw new ConflictException('Only products under review can be approved');
    }

    const stored = product.complianceProfile ?? {};
    const check = complianceProfileSchema.safeParse({
      productType: stored.productType,
      nicotineStrengthMgPerMl: stored.nicotineStrengthMgPerMl,
      containerVolumeMl: stored.containerVolumeMl,
      notificationNumber: stored.notificationNumber,
      mandatedWarnings: stored.mandatedWarnings ?? [],
      dutyClassification: stored.dutyClassification,
    });

    if (!check.success) {
      throw new ConflictException(
        'Compliance profile is incomplete — approval refused (fails closed)',
      );
    }

    const approved = await this.model.findOneAndUpdate(
      { _id: id, status: ProductStatus.REVIEW },
      {
        $set: {
          'complianceProfile.approvedBy': operator.actorId,
          'complianceProfile.approvedAt': new Date(),
          'complianceProfile.locked': true,
        },
      },
      { new: true },
    );

    await this.audit.record({
      actor: operator.actorId,
      action: 'compliance.profile.approved',
      subjectRef: `product:${id}`,
      after: { locked: true },
    });

    return approved;
  }

  async rejectReview(id: string, reason: string, operator: Operator) {
    const rejected = await this.transition(
      id,
      ProductStatus.REVIEW,
      ProductStatus.DRAFT,
      'compliance.review.rejected',
      operator,
      { reason },
    );
    return rejected;
  }

  /* ─────────────────────── public (storefront) reads ──────────────────── */

  /** PLP listing: sellable products only, with facet counts (spec §5.2). */
  async listSellable(query: ListProductsQuery): Promise<{
    items: ProductCard[];
    total: number;
    page: number;
    pageSize: number;
    facets: Record<string, { value: string; count: number }[]>;
  }> {
    // Multi-select facets (§5.2) resolve to `$in`. Every value is Zod-validated
    // (enum/number/bounded string) and the operators are server-built, so
    // `trusted()` is safe against the global sanitizeFilter — no user string
    // ever reaches a Mongo operator position.
    const filter: Record<string, unknown> = { status: ProductStatus.SELLABLE };
    if (query.category) filter.category = query.category;
    if (query.type?.length) {
      filter['complianceProfile.productType'] = trusted({ $in: query.type });
    }
    if (query.brand?.length) filter.brand = trusted({ $in: query.brand });
    if (query.range?.length) filter.range = trusted({ $in: query.range });
    if (query.strengthMgPerMl?.length) {
      filter['complianceProfile.nicotineStrengthMgPerMl'] = trusted({
        $in: query.strengthMgPerMl,
      });
    }
    if (query.volumeMl?.length) {
      filter['complianceProfile.containerVolumeMl'] = trusted({
        $in: query.volumeMl,
      });
    }
    if (query.vgPg?.length) {
      filter['specification.vgPg'] = trusted({ $in: query.vgPg });
    }
    if (query.inStock === 'true') {
      filter.variants = trusted({ $elemMatch: { inStockStub: true } });
    } else if (query.inStock === 'false') {
      filter.$nor = trusted([
        { variants: trusted({ $elemMatch: { inStockStub: true } }) },
      ]);
    }
    if (query.price?.length) {
      // Any selected bucket matches (OR across buckets), evaluated on the
      // product's minimum variant net price.
      const clauses = query.price
        .map((key) => PRICE_BUCKETS[key])
        .filter((bucket): bucket is { min: number; max: number } => !!bucket)
        .map((bucket) => ({
          $and: [
            { $gte: [{ $min: '$variants.netPriceMinor' }, bucket.min] },
            { $lte: [{ $min: '$variants.netPriceMinor' }, bucket.max] },
          ],
        }));
      if (clauses.length) filter.$expr = trusted({ $or: clauses });
    }

    const sort: Record<string, 1 | -1> =
      query.sort === 'name'
        ? { name: 1 }
        : query.sort === 'price-asc' || query.sort === 'price-desc'
          ? { createdAt: -1 } // price sort applied post-query until indexed min-price field
          : { createdAt: -1 };

    const [items, total, facets] = await Promise.all([
      this.model
        .find(filter)
        .sort(sort)
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .lean(),
      this.model.countDocuments(filter),
      this.facetCounts(query.category),
    ]);

    let cards = items.map((item) => toProductCard(item, this.pricing.params));
    if (query.sort === 'price-asc' || query.sort === 'price-desc') {
      cards = [...cards].sort((a, b) => {
        const pa = a.fromPrice?.totalMinor ?? Number.MAX_SAFE_INTEGER;
        const pb = b.fromPrice?.totalMinor ?? Number.MAX_SAFE_INTEGER;
        return query.sort === 'price-asc' ? pa - pb : pb - pa;
      });
    }

    return {
      items: cards,
      total,
      page: query.page,
      pageSize: query.pageSize,
      facets,
    };
  }

  /** PDP read — sellable only; drafts/review/retired are invisible. */
  async getSellableBySlug(slug: string): Promise<{
    product: ProductDetail;
    related: ProductCard[];
  }> {
    const product = await this.model
      .findOne({ slug, status: ProductStatus.SELLABLE })
      .lean();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const related = await this.model
      .find({
        status: ProductStatus.SELLABLE,
        category: product.category,
        _id: trusted({ $ne: product._id }),
      })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    return {
      product: toProductDetail(product, this.pricing.params),
      related: related.map((item) => toProductCard(item, this.pricing.params)),
    };
  }

  /**
   * Resolve variants by SKU across SELLABLE products only — the read Cart
   * and Checkout use to price and validate lines (bounded contexts,
   * §16.7: no module reads another module's collections). Returns a map
   * keyed by SKU; missing keys mean "not purchasable right now", which
   * callers must treat as a hard failure at checkout time (§6.2).
   */
  async resolveSellableVariants(
    skus: string[],
  ): Promise<
    Map<string, { product: Record<string, any>; variant: Record<string, any> }>
  > {
    if (skus.length === 0) return new Map();

    const products = await this.model
      .find({
        status: ProductStatus.SELLABLE,
        'variants.sku': trusted({ $in: [...new Set(skus)] }),
      })
      .lean();

    const bySku = new Map<
      string,
      { product: Record<string, any>; variant: Record<string, any> }
    >();
    for (const product of products) {
      for (const variant of product.variants ?? []) {
        if (skus.includes(variant.sku)) {
          bySku.set(variant.sku, { product, variant });
        }
      }
    }
    return bySku;
  }

  /**
   * Text search over sellable products — consumed by the Search module
   * through this public interface (bounded contexts, spec §16.7: no module
   * reads another module's collections).
   */
  async searchSellable(term: string, limit: number): Promise<ProductCard[]> {
    // $text uses the index built from tokenised terms — user input is never
    // compiled into a regex, so there is nothing to escape or ReDoS. The
    // term itself is only ever a tokenised string inside $search.
    const results = await this.model
      .find(
        { status: ProductStatus.SELLABLE, $text: trusted({ $search: term }) },
        { score: { $meta: 'textScore' } },
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .lean();

    return results.map((item) => toProductCard(item, this.pricing.params));
  }

  /* ───────────────────────── admin reads ─────────────────────────────── */

  /**
   * Console listing: status filter + free-text search + paging, plus
   * per-status counts so the UI can label its filter chips. Search input
   * is regex-escaped, anchored to a case-insensitive substring match on
   * name/brand/SKU — user text is never compiled into a raw pattern.
   */
  async adminList(query: AdminListQuery) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;

    if (query.q) {
      const escaped = query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = trusted({ $regex: escaped, $options: 'i' });
      filter.$or = trusted([
        { name: pattern },
        { brand: pattern },
        { 'variants.sku': pattern },
      ]);
    }

    const [items, total, countRows] = await Promise.all([
      this.model
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .lean(),
      this.model.countDocuments(filter),
      this.model.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const counts: Record<string, number> = { all: 0 };
    for (const row of countRows) {
      counts[row._id] = row.count;
      counts.all += row.count;
    }

    return { items, total, page: query.page, pageSize: query.pageSize, counts };
  }

  async adminGet(id: string) {
    return this.requireById(id);
  }

  /**
   * Delete a DRAFT permanently. Products that ever reached review or sale
   * are never deleted — they retire, preserving the audit/compliance
   * record (spec §4.6). The status precondition is atomic.
   */
  async deleteDraft(id: string, operator: Operator) {
    const deleted = await this.model.findOneAndDelete({
      _id: id,
      status: ProductStatus.DRAFT,
    });

    if (!deleted) {
      await this.explainTransitionFailure(id, [ProductStatus.DRAFT]);
    }

    await this.audit.record({
      actor: operator.actorId,
      action: 'catalogue.product.draft_deleted',
      subjectRef: `product:${id}`,
      before: {
        name: deleted!.name,
        slug: deleted!.slug,
        status: ProductStatus.DRAFT,
      },
    });

    return { deleted: true };
  }

  /* ─────────────────────────── internals ─────────────────────────────── */

  /** Atomic status transition with audit; throws 409 on precondition miss. */
  private async transition(
    id: string,
    from: ProductStatus,
    to: ProductStatus,
    action: string,
    operator: Operator,
    extra?: Record<string, unknown>,
  ) {
    const updated = await this.model.findOneAndUpdate(
      { _id: id, status: from },
      { $set: { status: to } },
      { new: true },
    );

    if (!updated) {
      await this.explainTransitionFailure(id, [from]);
    }

    await this.audit.record({
      actor: operator.actorId,
      action,
      subjectRef: `product:${id}`,
      before: { status: from },
      after: { status: to, ...extra },
    });

    return updated;
  }

  /** Turn a failed atomic update into a precise 404/409. */
  private async explainTransitionFailure(
    id: string,
    expected: ProductStatus[],
  ): Promise<never> {
    const current = await this.model.findById(id).lean();
    if (!current) {
      throw new NotFoundException('Product not found');
    }
    throw new ConflictException(
      `Product is "${current.status}" — expected ${expected.join(' or ')}`,
    );
  }

  private async requireById(id: string): Promise<ProductDocument> {
    const product = await this.model.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  /** Append -2, -3… on slug collision; bounded to avoid pathological loops. */
  private async uniqueSlug(base: string): Promise<string> {
    let candidate = base;
    for (let i = 2; i <= 50; i += 1) {
      const exists = await this.model.exists({ slug: candidate });
      if (!exists) return candidate;
      candidate = `${base}-${i}`;
    }
    throw new ConflictException('Could not derive a unique slug');
  }

  /** Facet counts for the PLP sidebar, scoped to the active category. */
  private async facetCounts(category?: string) {
    const match: Record<string, unknown> = { status: ProductStatus.SELLABLE };
    if (category) match.category = category;

    const [
      byType,
      byBrand,
      byStrength,
      byVolume,
      byVgPg,
      byRange,
      inStockCount,
      outStockCount,
      priceBuckets,
    ] = await Promise.all([
      this.groupCount(match, '$complianceProfile.productType'),
      this.groupCount(match, '$brand'),
      this.groupCount(match, '$complianceProfile.nicotineStrengthMgPerMl'),
      this.groupCount(match, '$complianceProfile.containerVolumeMl'),
      this.groupCount(match, '$specification.vgPg'),
      this.groupCount(match, '$range'),
      this.model.countDocuments({
        ...match,
        variants: trusted({ $elemMatch: { inStockStub: true } }),
      }),
      this.model.countDocuments({
        ...match,
        $nor: trusted([
          { variants: trusted({ $elemMatch: { inStockStub: true } }) },
        ]),
      }),
      this.priceBucketCounts(match),
    ]);

    return {
      type: byType,
      brand: byBrand,
      strengthMgPerMl: byStrength,
      volumeMl: byVolume,
      vgPg: byVgPg,
      range: byRange,
      inStock: [
        { value: 'true', count: inStockCount },
        { value: 'false', count: outStockCount },
      ].filter((row) => row.count > 0),
      price: priceBuckets,
    };
  }

  private async priceBucketCounts(match: Record<string, unknown>) {
    const rows = await this.model.aggregate<{ _id: string; count: number }>([
      { $match: match },
      {
        $addFields: {
          minPrice: {
            $min: {
              $map: {
                input: '$variants',
                as: 'v',
                in: '$$v.netPriceMinor',
              },
            },
          },
        },
      },
      { $match: { minPrice: { $ne: null } } },
      {
        $bucket: {
          groupBy: '$minPrice',
          boundaries: [0, 500, 1000, 2000, 10_000_001],
          default: 'over-20',
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    const labels: Record<string | number, string> = {
      0: 'under-5',
      500: '5-10',
      1000: '10-20',
      2000: 'over-20',
      'over-20': 'over-20',
    };

    return rows
      .map((row) => ({
        value: labels[row._id] ?? String(row._id),
        count: row.count,
      }))
      .filter((row) => PRICE_BUCKETS[row.value]);
  }

  private async groupCount(match: Record<string, unknown>, field: string) {
    const rows = await this.model.aggregate<{ _id: unknown; count: number }>([
      { $match: match },
      { $group: { _id: field, count: { $sum: 1 } } },
      { $match: { _id: { $ne: null } } },
      { $sort: { count: -1 } },
      { $limit: 30 },
    ]);

    return rows.map((row) => ({ value: String(row._id), count: row.count }));
  }
}
