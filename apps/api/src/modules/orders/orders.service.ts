import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, trusted } from 'mongoose';

import { AuditService } from '../audit/audit.service';
import {
  PAYMENT_PORT,
  type PaymentProviderPort,
} from '../payments/payments.port';
import {
  Counter,
  Order,
  OrderDocument,
  OrderStatus,
  ORDER_TRANSITIONS,
} from './schemas/order.schema';

/** First order number — PHX-10001 reads better than PHX-1. */
const ORDER_SEQ_START = 10_000;

/**
 * Orders bounded context (spec §7.1).
 *
 * State is authoritative here: `transition` is the ONLY way an order
 * changes status — it enforces the §7.1 state machine atomically, appends
 * to the order's own event history, and writes the audit trail. Checkout
 * (and later fulfilment) request transitions; they never $set a status.
 */
@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly model: Model<Order>,
    @InjectModel(Counter.name) private readonly counters: Model<Counter>,
    private readonly audit: AuditService,
    @Inject(PAYMENT_PORT) private readonly psp: PaymentProviderPort,
  ) {}

  /** Create in `created` with the full commercial snapshot (§7.2). */
  async create(
    snapshot: Omit<
      Order,
      | 'orderNumber'
      | 'status'
      | 'events'
      | 'schemaVersion'
      | 'createdAt'
      | 'updatedAt'
    >,
    actor: string,
  ): Promise<OrderDocument> {
    const orderNumber = await this.nextOrderNumber();

    const order = await this.model.create({
      ...snapshot,
      orderNumber,
      status: OrderStatus.CREATED,
      events: [
        {
          at: new Date(),
          to: OrderStatus.CREATED,
          actor,
          note: 'Order created',
        },
      ],
    });

    await this.audit.record({
      actor,
      action: 'order.created',
      subjectRef: `order:${orderNumber}`,
      after: { totalMinor: order.totals.totalMinor, lines: order.lines.length },
    });

    return order;
  }

  /**
   * The single legal way to move an order (§7.1). The from-status is part
   * of the atomic update, so two racing transitions cannot both win; the
   * loser gets a 409 explaining the actual state.
   */
  async transition(
    orderId: string,
    from: OrderStatus,
    to: OrderStatus,
    actor: string,
    options: { note?: string; set?: Record<string, unknown> } = {},
  ): Promise<OrderDocument> {
    if (!ORDER_TRANSITIONS[from]?.includes(to)) {
      throw new ConflictException(`Illegal order transition ${from} → ${to}`);
    }

    const updated = await this.model.findOneAndUpdate(
      { _id: orderId, status: from },
      {
        $set: { status: to, ...(options.set ?? {}) },
        $push: {
          events: { at: new Date(), from, to, actor, note: options.note },
        },
      },
      { new: true },
    );

    if (!updated) {
      const current = await this.model.findById(orderId).lean();
      if (!current) throw new NotFoundException('Order not found');
      throw new ConflictException(
        `Order is "${current.status}" — expected "${from}"`,
      );
    }

    await this.audit.record({
      actor,
      action: `order.${to}`,
      subjectRef: `order:${updated.orderNumber}`,
      before: { status: from },
      after: { status: to, ...(options.note ? { note: options.note } : {}) },
    });

    return updated;
  }

  /* ───────────────────────── customer reads ───────────────────────── */

  async listForCustomer(customerId: string) {
    return this.model
      .find({ customerId: new Types.ObjectId(customerId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  }

  /** Scoped by customer — one customer can never read another's order. */
  async getForCustomer(customerId: string, orderNumber: string) {
    const order = await this.model
      .findOne({
        customerId: new Types.ObjectId(customerId),
        orderNumber,
      })
      .lean();

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  /* ───────────────────────── operator reads (§7.3) ────────────────── */

  /**
   * Order-management console listing: status filter + free-text (order
   * number or email) + paging, with per-status counts for the filter chips.
   * Search input is regex-escaped and wrapped in `trusted()` so user text
   * never reaches a Mongo operator position.
   */
  async adminList(query: {
    status?: OrderStatus;
    q?: string;
    page: number;
    pageSize: number;
  }) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.q) {
      const escaped = query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = trusted({ $regex: escaped, $options: 'i' });
      filter.$or = trusted([{ orderNumber: pattern }, { email: pattern }]);
    }

    const [items, total, countRows] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .lean(),
      this.model.countDocuments(filter),
      this.model.aggregate<{ _id: string; n: number }>([
        { $group: { _id: '$status', n: { $sum: 1 } } },
      ]),
    ]);

    const counts: Record<string, number> = {};
    for (const row of countRows) counts[row._id] = row.n;

    return { items, total, counts };
  }

  /** Any order by its number — operator scope (not customer-scoped). */
  async adminGetByNumber(orderNumber: string) {
    const order = await this.model.findOne({ orderNumber }).lean();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  /* ─────────────────── operator controls (§7.3) ───────────────────── */

  /** Pause fulfilment on an accepted order. */
  async hold(orderNumber: string, actor: string) {
    const order = await this.requireDocByNumber(orderNumber);
    return this.transition(
      order.id as string,
      OrderStatus.ACCEPTED,
      OrderStatus.ON_HOLD,
      actor,
      { note: 'Placed on hold by operator' },
    );
  }

  /** Resume a held order. */
  async release(orderNumber: string, actor: string) {
    const order = await this.requireDocByNumber(orderNumber);
    return this.transition(
      order.id as string,
      OrderStatus.ON_HOLD,
      OrderStatus.ACCEPTED,
      actor,
      { note: 'Released from hold by operator' },
    );
  }

  /**
   * Cancel an accepted or held order, refunding a captured payment first
   * (§7.3, §6.4). The refund must succeed before the order moves to
   * Cancelled — a failed refund leaves the order exactly as it was, so
   * money and status never disagree.
   */
  async cancel(orderNumber: string, actor: string, reason?: string) {
    const order = await this.requireDocByNumber(orderNumber);
    const from = order.status;
    if (from !== OrderStatus.ACCEPTED && from !== OrderStatus.ON_HOLD) {
      throw new ConflictException(`Cannot cancel an order that is "${from}"`);
    }

    let set: Record<string, unknown> | undefined;
    if (order.payment?.status === 'captured' && order.payment.intentId) {
      const amount = order.totals.totalMinor;
      const { refunded } = await this.psp
        .refund(order.payment.intentId, amount)
        .catch(() => ({ refunded: false }));
      if (!refunded) {
        throw new ServiceUnavailableException(
          'Refund failed at the payment provider — order not cancelled',
        );
      }
      set = {
        'payment.status': 'refunded',
        'payment.refundedAt': new Date(),
        'payment.refundedMinor': amount,
      };
    }

    return this.transition(order.id as string, from, OrderStatus.CANCELLED, actor, {
      note: reason ? `Cancelled: ${reason}` : 'Cancelled by operator',
      set,
    });
  }

  private async requireDocByNumber(orderNumber: string): Promise<OrderDocument> {
    const order = await this.model.findOne({ orderNumber });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  /**
   * Finance summary (spec §28) — captured revenue with the itemised
   * net/duty/VAT split that matters for a duty-registered vaping retailer.
   * "Realised" figures count only ACCEPTED orders (money actually taken);
   * status counts give the finance operator the whole funnel at a glance.
   */
  async financeSummary(fromISO?: string, toISO?: string) {
    const createdAt: Record<string, Date> = {};
    if (fromISO) createdAt.$gte = new Date(fromISO);
    if (toISO) createdAt.$lte = new Date(`${toISO}T23:59:59.999Z`);
    const dateMatch = Object.keys(createdAt).length ? { createdAt } : {};

    const [statusRows, revenueRows] = await Promise.all([
      this.model.aggregate<{ _id: string; n: number }>([
        { $match: dateMatch },
        { $group: { _id: '$status', n: { $sum: 1 } } },
      ]),
      this.model.aggregate<{
        orders: number;
        net: number;
        duty: number;
        vat: number;
        total: number;
      }>([
        { $match: { ...dateMatch, status: OrderStatus.ACCEPTED } },
        {
          $group: {
            _id: null,
            orders: { $sum: 1 },
            net: { $sum: '$totals.netMinor' },
            duty: { $sum: '$totals.dutyMinor' },
            vat: { $sum: '$totals.vatMinor' },
            total: { $sum: '$totals.totalMinor' },
          },
        },
      ]),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const row of statusRows) statusCounts[row._id] = row.n;

    const rev = revenueRows[0] ?? { orders: 0, net: 0, duty: 0, vat: 0, total: 0 };
    return {
      range: { from: fromISO ?? null, to: toISO ?? null },
      statusCounts,
      realised: {
        orders: rev.orders,
        netMinor: rev.net,
        dutyMinor: rev.duty,
        vatMinor: rev.vat,
        totalMinor: rev.total,
      },
    };
  }

  /* ─────────────────────────── internals ─────────────────────────── */

  private async nextOrderNumber(): Promise<string> {
    const counter = await this.counters.findByIdAndUpdate(
      'orderNumber',
      { $inc: { seq: 1 }, $setOnInsert: {} },
      { new: true, upsert: true },
    );
    return `PHX-${ORDER_SEQ_START + counter.seq}`;
  }
}
