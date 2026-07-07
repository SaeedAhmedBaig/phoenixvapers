import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Notification } from "./schemas/notification.schema";
import { ConsoleEmailAdapter, EmailProvider } from "./email-provider.interface";
import { formatGBP } from "../../common/utils/money.util";

@Injectable()
export class NotificationsService {
  private readonly emailProvider: EmailProvider = new ConsoleEmailAdapter();

  constructor(@InjectModel(Notification.name) private readonly model: Model<Notification>) {}

  async list(limit = 50): Promise<Notification[]> {
    return this.model.find().sort({ createdAt: -1 }).limit(limit).lean() as any;
  }

  async sendOrderConfirmation(input: {
    userId?: string;
    email: string;
    orderNumber: string;
    totalMinor: number;
  }): Promise<void> {
    const message = {
      to: input.email,
      subject: `Phoenix Vapers order ${input.orderNumber} confirmed`,
      body: `Thank you for your order. Your total was ${formatGBP(input.totalMinor)}. We'll email you again once it's dispatched.`,
    };

    let status: "sent" | "failed" = "sent";
    try {
      await this.emailProvider.send(message);
    } catch {
      status = "failed";
    }

    await this.model.create({
      userId: input.userId,
      email: input.email,
      type: "order-confirmation",
      payload: { orderNumber: input.orderNumber, totalMinor: input.totalMinor },
      status,
    });
  }
}
