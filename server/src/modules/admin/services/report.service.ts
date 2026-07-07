import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class ReportService {
  constructor(@InjectModel("Order") private orderModel: Model<any>) {}

  async exportOrdersReport(
    format: "csv" | "xlsx",
    filters: { from?: Date; to?: Date; status?: string } = {},
  ) {
    const query: any = {};
    if (filters.from || filters.to) {
      query.createdAt = {};
      if (filters.from) query.createdAt.$gte = new Date(filters.from);
      if (filters.to) query.createdAt.$lte = new Date(filters.to);
    }
    if (filters.status) query.status = filters.status;

    const orders = await this.orderModel
      .find(query)
      .sort({ createdAt: -1 })
      .lean();

    if (!orders.length) throw new BadRequestException("No orders found");

    const data = orders.map((o) => ({
      "Order #": o.number,
      Date: new Date(o.createdAt).toLocaleDateString(),
      Customer: o.customerEmail,
      Items: o.items.length,
      Total: `£${(o.totalMinor / 100).toFixed(2)}`,
      Status: o.status,
      "Tracking #": o.trackingNumber || "-",
    }));

    if (format === "csv") return this.generateCSV(data, "Orders Report");
    if (format === "xlsx") return this.generateXLSX(data, "Orders Report");
    throw new BadRequestException("Format not supported");
  }

  private generateCSV(
    data: any[],
    filename: string,
  ): { buffer: Buffer; filename: string } {
    if (!data.length) throw new BadRequestException("No data to export");

    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((h) => row[h]));

    const csv =
      [headers, ...rows]
        .map((row) =>
          row.map((cell) => {
            if (typeof cell === "string" && (cell.includes(",") || cell.includes("\"))) {
              return `"${cell.replace(/"/g, "\"\"")}"`;
            }
            return cell;
          }),
        )
        .map((row) => row.join(","))
        .join("\n") + "\n";

    return {
      buffer: Buffer.from(csv),
      filename: `${filename}-${new Date().toISOString().split("T")[0]}.csv`,
    };
  }

  private generateXLSX(data: any[], sheetName: string): { buffer: Buffer; filename: string } {
    if (!data.length) throw new BadRequestException("No data to export");

    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((h) => row[h]));

    let xlsx = "data:application/vnd.ms-excel;base64,";
    const sheet = [headers, ...rows].map((row) => row.join("\t")).join("\n");

    return {
      buffer: Buffer.from(sheet),
      filename: `${sheetName}-${new Date().toISOString().split("T")[0]}.csv`,
    };
  }
}
