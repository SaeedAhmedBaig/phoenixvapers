"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Flame,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Menu,
  X,
} from "lucide-react";
import { useAdminAuth } from "../lib/admin-auth";
import { Button } from "../../components/ui/button";

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin", icon: BarChart3 },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Customers", href: "/admin/customers", icon: Users },
];

const SUPER_ADMIN_NAV = [
  { label: "Staff", href: "/admin/super/staff", icon: Users },
  { label: "Permissions", href: "/admin/super/permissions", icon: Settings },
  { label: "Reports", href: "/admin/super/reports", icon: BarChart3 },
];

const MERCHANT_NAV = [
  { label: "Merchant Dashboard", href: "/admin/merchant", icon: BarChart3 },
  { label: "Brand Settings", href: "/admin/merchant/settings", icon: Settings },
  { label: "Performance", href: "/admin/merchant/performance", icon: BarChart3 },
];

export function AdminSidebar({ open, onOpenChange }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAdminAuth();

  const isSuper = user?.role === "super-admin";
  const isMerchant = user?.role === "brand-partner";

  const navItems = isSuper ? SUPER_ADMIN_NAV : isMerchant ? MERCHANT_NAV : ADMIN_NAV;
  const otherNav = isSuper ? ADMIN_NAV : SUPER_ADMIN_NAV;

  async function handleLogout() {
    await logout();
    router.replace("/admin/login");
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 flex flex-col border-r border-border bg-card transition-transform duration-200 md:relative md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border p-4">
          <Link href="/admin" className="flex items-center gap-2 font-black no-underline">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Flame className="h-4 w-4" />
            </span>
            <span className="hidden text-foreground sm:inline">Phoenix</span>
          </Link>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-bold transition ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  }`}
                  onClick={() => onOpenChange(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Secondary Navigation */}
          {!isMerchant && otherNav.length > 0 && (
            <>
              <div className="mt-6 border-t border-border pt-6">
                <p className="px-4 text-xs font-black uppercase text-muted-foreground">
                  {isSuper ? "Staff Admin" : "Super Admin"}
                </p>
                <div className="mt-3 space-y-1">
                  {otherNav.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-bold transition ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-secondary"
                        }`}
                        onClick={() => onOpenChange(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-border p-3">
          <div className="rounded-lg bg-secondary p-3">
            <p className="text-xs font-bold uppercase text-muted-foreground">Signed in as</p>
            <p className="mt-1 text-sm font-black text-foreground">{user?.email}</p>
            <p className="text-xs font-bold text-primary">{user?.role}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>
    </>
  );
}
