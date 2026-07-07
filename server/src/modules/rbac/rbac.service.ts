import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Role } from "./schemas/role.schema";
import { CreateRoleDto, UpdateRoleDto } from "./dto/role.dto";
import { DEFAULT_ROLE_PERMISSIONS, ROLE_NAMES } from "../../common/constants/permissions";

@Injectable()
export class RbacService implements OnModuleInit {
  constructor(@InjectModel(Role.name) private readonly model: Model<Role>) {}

  /** Idempotently seeds the default roles so the platform is usable on first boot. */
  async onModuleInit(): Promise<void> {
    for (const name of Object.values(ROLE_NAMES)) {
      const exists = await this.model.exists({ name });
      if (!exists) {
        await this.model.create({
          name,
          permissions: DEFAULT_ROLE_PERMISSIONS[name],
          brandScoped: name === ROLE_NAMES.BRAND_PARTNER,
        });
      }
    }
  }

  findAll(): Promise<Role[]> {
    return this.model.find().lean() as any;
  }

  findByName(name: string): Promise<Role | null> {
    return this.model.findOne({ name }).lean() as any;
  }

  create(dto: CreateRoleDto): Promise<Role> {
    return this.model.create(dto);
  }

  async update(name: string, dto: UpdateRoleDto): Promise<Role | null> {
    return this.model.findOneAndUpdate({ name }, dto, { new: true }).lean() as any;
  }

  async permissionsFor(roleName: string): Promise<string[]> {
    const role = await this.findByName(roleName);
    return role?.permissions ?? [];
  }
}
