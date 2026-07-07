import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Order } from "../checkout/schemas/order.schema";

@Injectable()
export class ReportingService {
  constructor(@InjectModel(Order.name) private readonly orderModel: Model<Order>) {}

  async salesByDay(from: Date, to: Date) {
    return this.orderModel.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to }, status: { $nin: ["cancelled"] } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          revenueMinor: { $sum: "$totalMinor" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async topProducts(limit = 10) {
    return this.orderModel.aggregate([
      { $match: { status: { $nin: ["cancelled"] } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          unitsSold: { $sum: "$items.qty" },
          revenueMinor: { $sum: "$items.lineTotalMinor" },
        },
      },
      { $sort: { revenueMinor: -1 } },
      { $limit: limit },
    ]);
  }
}
