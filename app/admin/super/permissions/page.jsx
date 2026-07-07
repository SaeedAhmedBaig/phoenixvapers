"use client";

import { useRequireStaff } from "../../lib/admin-auth";
import { AdminLayout } from "../../components/admin-layout";
import { Button } from "../../../components/ui/button";
import { Lock, Users, ShoppingCart, Settings } from "lucide-react";

const ROLES_PERMISSIONS = [
  {
    role: "super-admin",
    icon: Lock,
    description: "Full system access and staff management",
    permissions: [
      "Manage all orders",
      "Manage products",
      "Manage customers",
      "Manage staff",
      "View reports",
      "Manage permissions",
      "System settings",
    ],
  },
  {
    role: "staff",
    icon: Users,
    description: "Standard operational staff access",
    permissions: [
      "View orders",
      "Update order status",
      "Manage products",
      "View customers",
      "Process refunds",
    ],
  },
  {
    role: "brand-partner",
    icon: ShoppingCart,
    description: "Limited to brand-specific data",
    permissions: [
      "View own orders",
      "View own products",
      "Update product pricing",
      "View own performance",
      "Brand settings",
    ],
  },
];

export default function SuperAdminPermissionsPage() {
  const { ready } = useRequireStaff();

  if (!ready) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Permission Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Configure role-based access control</p>
        </div>

        {/* Roles */}
        <div className="grid gap-6 lg:grid-cols-3">
          {ROLES_PERMISSIONS.map((roleSet) => {
            const Icon = roleSet.icon;
            return (
              <div key={roleSet.role} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-foreground capitalize">{roleSet.role}</h2>
                    <p className="text-xs text-muted-foreground">{roleSet.description}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  {roleSet.permissions.map((permission) => (
                    <label key={permission} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded border-border"
                      />
                      <span className="text-sm font-bold text-foreground">{permission}</span>
                    </label>
                  ))}
                </div>

                <Button className="mt-6 w-full" variant="outline" size="sm">
                  Save Permissions
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
