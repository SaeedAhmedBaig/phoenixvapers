import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuditLog } from "./schemas/audit-log.schema";
import { Paginated, paginate } from "../../common/dto/pagination.dto";

export interface RecordAuditInput {
  actorId?: string;
  actorEmail?: string;
  method: string;
  path: string;
  entityType?: string;
  entityId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  statusCode: number;
  ip?: string;
}

@Injectable()
export class AuditService {
  constructor(@InjectModel(AuditLog.name) private readonly model: Model<AuditLog>) {}

  async record(input: RecordAuditInput): Promise<void> {
    await this.model.create(input);
  }

  async list(page: number, limit: number, entityType?: string): Promise<Paginated<AuditLog>> {
    const filter = entityType ? { entityType } : {};
    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean() as any,
      this.model.countDocuments(filter),
    ]);
    return paginate(items as AuditLog[], total, page, limit);
  }

  async findById(id: string): Promise<AuditLog | null> {
    return this.model.findById(id).lean() as any;
  }
}
