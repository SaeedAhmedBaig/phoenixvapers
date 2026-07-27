"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Receipt,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import { OPERATOR_ROLE_LABELS as ROLE_LABEL } from "@phoenix/utils/rbac";

import { logoutAction } from "@/app/(account)/actions";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

const ICONS = {
  "/admin": LayoutDashboard,
  "/admin/orders": Receipt,
  "/admin/reports": BarChart3,
  "/admin/products": Boxes,
  "/admin/customers": ShieldCheck,
  "/admin/fulfilment": Truck,
  "/admin/marketing": Megaphone,
  "/admin/staff": Users,
  "/admin/roles": KeyRound,
  "/admin/access": KeyRound,
};

function isActive(pathname, href) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Flatten grouped nav for the active-item lookup and the mobile rail. */
function flatItems(nav) {
  return nav.flatMap((group) => group.items);
}

/**
 * Operations console shell — executive layout inspired by Notion's calm,
 * grouped information architecture, rendered strictly in Phoenix tokens:
 * Ink Green (`forest-ink`) chrome in both themes (brand rule), `pine`/green
 * as the single accent, radius-0 surfaces. Grouped sidebar sections, a top
 * bar with breadcrumb + identity, and a left-accent active state.
 *
 * `nav` is pre-filtered per role by the layout; the API still enforces every
 * action, so this only decides what to render (§25.1).
 */
export function AdminShell({ operator, nav, children }) {
  const pathname = usePathname();
  const active = flatItems(nav).find((i) => isActive(pathname, i.href));
  const pageTitle = active?.label ?? "Console";

  return (
    <div className="bg-background flex min-h-screen">
      {/* ───────────────── Sidebar (desktop) ───────────────── */}
      <aside className="bg-forest-ink text-chrome-fg hidden w-64 shrink-0 flex-col md:flex">
        {/* Fixed h-16 — matches the top bar's h-16 exactly, so the sidebar's
            bottom border and the top bar's bottom border sit on the same
            horizontal line regardless of either block's content. */}
        <div className="border-chrome-fg/10 flex h-16 flex-col justify-center border-b px-5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="bg-primary text-primary-foreground inline-flex size-6 shrink-0 items-center justify-center text-[13px] font-bold">
              P
            </span>
            <span className="font-display text-base leading-none font-medium">Phoenix</span>
          </Link>
          <p className="text-chrome-fg/45 mt-1.5 pl-[34px] text-[11px] leading-none">Operations console</p>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {nav.map((group) => (
            <div key={group.section}>
              <p className="text-chrome-fg/40 px-2 pb-1.5 text-[10px] font-semibold tracking-wider uppercase">
                {group.section}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = ICONS[item.href] ?? LayoutDashboard;
                  const activeItem = isActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={activeItem ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 border-l-2 py-2 pr-3 pl-2.5 text-sm transition-colors",
                        activeItem
                          ? "border-primary bg-chrome-fg/10 text-chrome-fg font-medium"
                          : "text-chrome-fg/65 hover:bg-chrome-fg/5 hover:text-chrome-fg border-transparent",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-chrome-fg/10 flex items-center gap-2 border-t p-3">
          <span className="bg-chrome-fg/10 text-chrome-fg inline-flex size-8 shrink-0 items-center justify-center text-xs font-semibold uppercase">
            {(operator.firstName?.[0] ?? "") + (operator.lastName?.[0] ?? "")}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-xs font-medium">{operator.firstName} {operator.lastName}</p>
            <p className="text-chrome-fg/50 truncate text-[11px]">{ROLE_LABEL[operator.role] ?? operator.role}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Sign out"
              className="text-chrome-fg/60 hover:bg-chrome-fg/10 hover:text-chrome-fg inline-flex size-8 items-center justify-center transition-colors"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </aside>

      {/* ───────────────── Main column ───────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Executive top bar (desktop) */}
        <header className="border-border bg-card sticky top-0 z-30 hidden h-16 items-center gap-4 border-b px-6 md:flex">
          <div className="min-w-0">
            <p className="text-muted-foreground text-[11px] leading-none">Phoenix Console</p>
            <h1 className="font-display mt-0.5 truncate text-sm leading-none font-medium">{pageTitle}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <span className="border-border text-muted-foreground hidden items-center gap-1.5 border px-2.5 py-1 text-xs lg:inline-flex">
              <span className="bg-primary size-1.5 rounded-full" aria-hidden />
              {ROLE_LABEL[operator.role] ?? operator.role}
            </span>
          </div>
        </header>

        {/* Mobile top bar + rail */}
        <div className="bg-forest-ink text-chrome-fg flex items-center justify-between px-4 py-3 md:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground inline-flex size-5 items-center justify-center text-[11px] font-bold">P</span>
            <span className="font-display font-medium">Phoenix Console</span>
          </Link>
          <form action={logoutAction}>
            <button type="submit" aria-label="Sign out" className="text-chrome-fg/80 inline-flex size-8 items-center justify-center">
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
        <nav className="bg-forest-ink text-chrome-fg flex gap-1 overflow-x-auto px-2 pb-2 md:hidden" aria-label="Console sections">
          {flatItems(nav).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={cn(
                "shrink-0 px-3 py-1.5 text-xs",
                isActive(pathname, item.href) ? "bg-chrome-fg/15 font-medium" : "text-chrome-fg/70",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
