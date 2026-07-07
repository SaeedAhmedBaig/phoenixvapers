import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { Order, OrderStatus } from "./schemas/order.schema";
import { Counter } from "./schemas/counter.schema";
import { Paginated, paginate } from "../../common/dto/pagination.dto";
import type { AuthUser } from "../../common/types/auth-user.type";
import { ROLE_NAMES } from "../../common/constants/permissions";

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(Counter.name) private readonly counterModel: Model<Counter>,
  ) {}

  async nextOrderNumber(): Promise<string> {
    const counter = await this.counterModel.findByIdAndUpdate(
      "order",
      { $inc: { seq: 1 } },
      { upsert: true, new: true },
    );
    return `PV-${100000 + counter.seq}`;
  }

  async listForUser(userId: string, page = 1, limit = 20): Promise<Paginated<Order>> {
    const filter = { user: userId };
    const [items, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean() as any,
      this.orderModel.countDocuments(filter),
    ]);
    return paginate(items as Order[], total, page, limit);
  }

  async listAll(page = 1, limit = 20, status?: string): Promise<Paginated<Order>> {
    const filter: FilterQuery<Order> = status ? { status } : {};
    const [items, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean() as any,
      this.orderModel.countDocuments(filter),
    ]);
    return paginate(items as Order[], total, page, limit);
  }

  async findByOrderNumber(orderNumber: string, requester?: AuthUser): Promise<Order> {
    const order = await this.orderModel.findOne({ orderNumber }).lean() as any;
    if (!order) throw new NotFoundException(`Order "${orderNumber}" not found`);

    if (requester && requester.role === ROLE_NAMES.CUSTOMER) {
      if (!order.user || order.user.toString() !== requester.userId) {
        throw new ForbiddenException("This order does not belong to your account");
      }
    }
    return order as Order;
  }

  async updateStatus(orderNumber: string, status: OrderStatus, trackingNumber?: string): Promise<Order> {
    const updated = await this.orderModel
      .findOneAndUpdate({ orderNumber }, { status, ...(trackingNumber ? { trackingNumber } : {}) }, { new: true })
      .lean() as any;
    if (!updated) throw new NotFoundException(`Order "${orderNumber}" not found`);
    return updated as Order;
  }
}
