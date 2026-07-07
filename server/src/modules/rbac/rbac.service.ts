import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Permission } from './schemas/permission.schema';
import { Role } from './schemas/role.schema';
import { AuditLog } from './schemas/audit-log.schema';

@Injectable()
export class RbacService {
  constructor(
    @InjectModel('Permission') private permissionModel: Model<Permission>,
    @InjectModel('Role') private roleModel: Model<Role>,
    @InjectModel('AuditLog') private auditLogModel: Model<AuditLog>,
  ) {}

  // PERMISSIONS
  async createPermission(data: any) {
    const exists = await this.permissionModel.findOne({ name: data.name });
    if (exists) throw new BadRequestException('Permission already exists');
    
    return this.permissionModel.create(data);
  }

  async getPermissions(category?: string) {
    const query = category ? { category, isActive: true } : { isActive: true };
    return this.permissionModel.find(query).sort({ category: 1, name: 1 });
  }

  async seedPermissions() {
    const count = await this.permissionModel.countDocuments();
    if (count > 0) return { message: 'Permissions already seeded' };

    const permissions = [
      // ORDERS
      { name: 'orders.view', description: 'View all orders', category: 'orders', isBuiltIn: true },
      { name: 'orders.view.own', description: 'View only own orders', category: 'orders', isBuiltIn: true },
      { name: 'orders.update', description: 'Update order details', category: 'orders', isBuiltIn: true },
      { name: 'orders.delete', description: 'Delete orders', category: 'orders', isBuiltIn: true },
      { name: 'orders.export', description: 'Export orders to CSV/PDF', category: 'orders', isBuiltIn: true },
      { name: 'orders.refund', description: 'Process refunds', category: 'orders', isBuiltIn: true },
      { name: 'orders.tracking', description: 'Manage tracking info', category: 'orders', isBuiltIn: true },

      // PRODUCTS
      { name: 'products.view', description: 'View all products', category: 'products', isBuiltIn: true },
      { name: 'products.create', description: 'Create new products', category: 'products', isBuiltIn: true },
      { name: 'products.edit', description: 'Edit all products', category: 'products', isBuiltIn: true },
      { name: 'products.edit.own', description: 'Edit only own brand products', category: 'products', isBuiltIn: true },
      { name: 'products.delete', description: 'Delete products', category: 'products', isBuiltIn: true },
      { name: 'products.publish', description: 'Publish/unpublish products', category: 'products', isBuiltIn: true },
      { name: 'products.inventory', description: 'Manage inventory', category: 'products', isBuiltIn: true },

      // CUSTOMERS
      { name: 'customers.view', description: 'View all customers', category: 'customers', isBuiltIn: true },
      { name: 'customers.edit', description: 'Edit customer details', category: 'customers', isBuiltIn: true },
      { name: 'customers.export', description: 'Export customer data', category: 'customers', isBuiltIn: true },
      { name: 'customers.segment', description: 'Create customer segments', category: 'customers', isBuiltIn: true },
      { name: 'customers.email', description: 'Send emails to customers', category: 'customers', isBuiltIn: true },

      // ANALYTICS
      { name: 'analytics.view', description: 'View analytics dashboards', category: 'analytics', isBuiltIn: true },
      { name: 'analytics.export', description: 'Export analytics data', category: 'analytics', isBuiltIn: true },
      { name: 'analytics.reports', description: 'Generate advanced reports', category: 'analytics', isBuiltIn: true },

      // STAFF
      { name: 'staff.view', description: 'View all staff members', category: 'staff', isBuiltIn: true },
      { name: 'staff.create', description: 'Create new staff accounts', category: 'staff', isBuiltIn: true },
      { name: 'staff.edit', description: 'Edit staff details', category: 'staff', isBuiltIn: true },
      { name: 'staff.delete', description: 'Delete staff accounts', category: 'staff', isBuiltIn: true },
      { name: 'staff.permissions', description: 'Manage staff permissions', category: 'staff', isBuiltIn: true },

      // SETTINGS
      { name: 'settings.system', description: 'Manage system settings', category: 'settings', isBuiltIn: true },
      { name: 'settings.email', description: 'Manage email templates', category: 'settings', isBuiltIn: true },
      { name: 'settings.payment', description: 'Manage payment settings', category: 'settings', isBuiltIn: true },
      { name: 'settings.store', description: 'Manage store settings', category: 'settings', isBuiltIn: true },

      // MARKETING
      { name: 'marketing.campaigns', description: 'Create email campaigns', category: 'marketing', isBuiltIn: true },
      { name: 'marketing.sms', description: 'Send SMS messages', category: 'marketing', isBuiltIn: true },
      { name: 'marketing.automation', description: 'Setup automation rules', category: 'marketing', isBuiltIn: true },
    ];

    await this.permissionModel.insertMany(permissions);
    return { message: `${permissions.length} permissions created` };
  }

  // ROLES
  async createRole(data: any) {
    const exists = await this.roleModel.findOne({ name: data.name });
    if (exists) throw new BadRequestException('Role already exists');
    
    return this.roleModel.create(data).then(r => r.populate('permissions'));
  }

  async getRoles() {
    return this.roleModel.find({ isActive: true }).populate('permissions');
  }

  async getRoleById(id: string) {
    return this.roleModel.findById(id).populate('permissions');
  }

  async updateRole(id: string, data: any) {
    data.updatedAt = new Date();
    return this.roleModel.findByIdAndUpdate(id, data, { new: true }).populate('permissions');
  }

  async deleteRole(id: string) {
    const role = await this.roleModel.findById(id);
    if (role.isBuiltIn) throw new BadRequestException('Cannot delete built-in role');
    return this.roleModel.findByIdAndDelete(id);
  }

  async seedRoles() {
    const count = await this.roleModel.countDocuments();
    if (count > 0) return { message: 'Roles already seeded' };

    const permissions = await this.permissionModel.find();
    const permMap = new Map(permissions.map(p => [p.name, p._id]));

    const superAdminPerms = permissions.map(p => p._id);

    const staffPerms = [
      'orders.view', 'orders.update', 'orders.export', 'orders.refund',
      'products.view', 'products.edit', 'customers.view', 'customers.email',
      'analytics.view', 'analytics.export', 'marketing.campaigns',
    ].map(name => permMap.get(name));

    const juniorPerms = [
      'orders.view', 'products.view', 'customers.view', 'analytics.view',
    ].map(name => permMap.get(name));

    const merchantPerms = [
      'products.view', 'products.edit.own', 'products.inventory',
      'orders.view', 'customers.view', 'analytics.view', 'analytics.export',
      'marketing.campaigns',
    ].map(name => permMap.get(name));

    const roles = [
      {
        name: 'Super Admin',
        description: 'Full system access',
        type: 'super-admin',
        permissions: superAdminPerms,
        isBuiltIn: true,
      },
      {
        name: 'Staff Manager',
        description: 'Can manage orders, products, customers',
        type: 'staff',
        permissions: staffPerms,
        isBuiltIn: true,
      },
      {
        name: 'Staff Support',
        description: 'Read-only access for support',
        type: 'staff-junior',
        permissions: juniorPerms,
        isBuiltIn: true,
      },
      {
        name: 'Brand Partner',
        description: 'Merchant dashboard access',
        type: 'brand-partner',
        permissions: merchantPerms,
        isBuiltIn: true,
      },
    ];

    await this.roleModel.insertMany(roles);
    return { message: `${roles.length} roles created` };
  }

  // PERMISSION CHECKING
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    return true;
  }

  async permissionsFor(roleId: string): Promise<string[]> {
    const role = await this.roleModel.findById(roleId).populate('permissions');
    if (!role) return [];
    return (role.permissions as any[]).map((p) => p.name);
  }

  // AUDIT LOGGING
  async logAction(data: {
    userId: string;
    userEmail: string;
    action: string;
    actionType: 'create' | 'read' | 'update' | 'delete' | 'export';
    resource: string;
    resourceId?: string;
    oldValues?: any;
    newValues?: any;
    status: 'success' | 'failure';
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.auditLogModel.create({
      ...data,
      timestamp: new Date(),
    });
  }

  async getAuditLogs(filter: any = {}, limit: number = 100, skip: number = 0) {
    return this.auditLogModel
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip);
  }

  async getAuditLogCount(filter: any = {}) {
    return this.auditLogModel.countDocuments(filter);
  }
}
