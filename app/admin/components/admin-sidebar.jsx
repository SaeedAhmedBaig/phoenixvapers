"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Flame,
  LayoutDashboard,
  LineChart,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Store,
  FileBarChart,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { useAdminAuth } from "../lib/admin-auth";
import { Button } from "../../components/ui/button";

/**
 * Navigation ordered by task frequency (operations first, insights second),
 * following the IA conventions of Shopify Admin / Stripe Dashboard:
 * Dashboard → daily operations (Orders, Products, Customers) → Analytics.
 * Role-scoped sections (Administration, Merchant) are grouped separately.
 */
const CORE_NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Analytics", href: "/admin/analytics", icon: LineChart },
];

const SUPER_ADMIN_NAV = [
  { label: "Staff", href: "/admin/super/staff", icon: UserCog },
  { label: "Permissions", href: "/admin/super/permissions", icon: ShieldCheck },
  { label: "Reports", href: "/admin/super/reports", icon: FileBarChart },
];

const MERCHANT_NAV = [
  { label: "Merchant Dashboard", href: "/admin/merchant", icon: Store },
  { label: "Brand Settings", href: "/admin/merchant/settings", icon: Settings },
  { label: "Performance", href: "/admin/merchant/performance", icon: LineChart },
];

export function AdminSidebar({ open, onOpenChange }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAdminAuth();

  const isSuper = user?.role === "super-admin";
  const isMerchant = user?.role === "brand-partner";

  // Everyone gets the core commerce nav; role-specific groups are appended.
  const navItems = isMerchant ? MERCHANT_NAV : CORE_NAV;
  const secondaryNav = isSuper ? SUPER_ADMIN_NAV : [];
  const secondaryLabel = "Administration";

  async function handleLogout() {
    await logout();
    router.replace("/admin/login");
  }

  return (
    <aside className="h-full flex flex-col border-r border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border p-4 flex-shrink-0">
        <Link href="/admin" className="flex items-center gap-2 font-black no-underline">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Flame className="h-4 w-4" />
          </span>
          <span className="text-foreground">Phoenix Admin</span>
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

      {/* Primary Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto p-3 scrollbar-hide">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-bold transition duration-150 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-secondary/50"
                }`}
                onClick={() => onOpenChange(false)}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Role-scoped secondary navigation */}
        {secondaryNav.length > 0 && (
          <>
            <div className="mt-6 border-t border-border pt-6">
              <p className="px-4 text-xs font-black uppercase text-muted-foreground">
                {secondaryLabel}
              </p>
              <div className="mt-3 space-y-1">
                {secondaryNav.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-bold transition duration-150 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground hover:bg-secondary/50"
                      }`}
                      onClick={() => onOpenChange(false)}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </nav>

      {/* User Info & Logout - Fixed at bottom */}
      <div className="border-t border-border p-3 flex-shrink-0">
        <div className="rounded-lg bg-secondary p-3">
          <p className="text-xs font-bold uppercase text-muted-foreground">Signed in as</p>
          <p className="mt-1 text-sm font-black text-foreground truncate">{user?.email}</p>
          <p className="text-xs font-bold text-primary capitalize">{user?.role?.replace("-", " ")}</p>
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
  );
}
