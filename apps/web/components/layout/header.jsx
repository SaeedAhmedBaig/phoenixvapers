"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, User } from "lucide-react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/c/e-liquids", label: "Shop" },
  { href: "/guidance", label: "Discover" },
  { href: "/our-standard", label: "Our Standard" },
  { href: "/wholesale", label: "Wholesale" },
];

function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
  if (href === "/c/e-liquids") return pathname.startsWith("/c/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header({ signedIn = false, cartCount = 0 }) {
  const pathname = usePathname();

  return (
    <header className="bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center gap-3 sm:h-16 sm:gap-4">
          <Link href="/" className="shrink-0">
            <span className="font-display text-base font-medium tracking-tight sm:text-lg">Phoenix Vapers</span>
          </Link>

          <nav className="hidden items-center gap-5 lg:flex xl:gap-6" aria-label="Main">
            {NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(pathname, l.href) ? "page" : undefined}
                className={
                  isActive(pathname, l.href)
                    ? "text-foreground text-sm font-medium"
                    : "text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                }
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Compact search — inline, not full-width */}
          <form
            action="/search"
            method="get"
            className="border-input bg-background ml-auto hidden max-w-[220px] items-center rounded-md border md:flex lg:max-w-[260px] xl:max-w-xs"
          >
            <Search className="text-muted-foreground ml-3 size-4 shrink-0" />
            <input
              name="q"
              type="search"
              placeholder="Search…"
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"
              aria-label="Search catalogue"
            />
          </form>

          {/* ml-auto here (not only on the search form) so the actions stay
              right-aligned on mobile, where the nav and inline search — which
              otherwise carry the push — are hidden below md. */}
          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            <Button asChild variant="ghost" size="icon" className="text-muted-foreground md:hidden">
              <Link href="/search" aria-label="Search"><Search className="size-4" /></Link>
            </Button>
            <ThemeToggle className="hidden sm:inline-flex" />
            {/* Account icon only when signed in — a single, unambiguous
                signed-in affordance (customers → account; operators are
                routed to /admin by the account entry). */}
            {signedIn ? (
              <Button asChild variant="ghost" size="icon" className="text-muted-foreground">
                <Link href="/account" aria-label="Account"><User className="size-4" /></Link>
              </Button>
            ) : null}
            <Button asChild variant="ghost" size="icon" className="text-muted-foreground relative">
              <Link href="/basket" aria-label={`Basket${cartCount ? ` (${cartCount})` : ""}`}>
                <ShoppingBag className="size-4" />
                {cartCount > 0 ? (
                  <span className="bg-primary text-primary-foreground absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-4 tabular-nums">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                ) : null}
              </Link>
            </Button>
            {/* One Sign in + one Sign up for EVERYONE (customers, staff,
                admins). Role is resolved server-side at login (§16.3). */}
            {!signedIn ? (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden text-sm sm:inline-flex">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm" className="hidden px-5 sm:inline-flex">
                  <Link href="/register">Sign up</Link>
                </Button>
              </>
            ) : null}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden"><Menu /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader><SheetTitle className="font-display">Menu</SheetTitle></SheetHeader>
                <nav className="mt-6 flex flex-col gap-1">
                  {NAV.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={`rounded-md px-3 py-2.5 text-sm ${isActive(pathname, l.href) ? "bg-accent text-pine font-medium" : "hover:bg-muted"}`}
                    >
                      {l.label}
                    </Link>
                  ))}
                </nav>
                {/* Pinned to the bottom (mt-auto) — matching the desktop
                    header's CTA hierarchy (Sign up solid/primary, Sign in
                    outline) instead of the inverted order this had before,
                    and anchored low so the panel doesn't read as half-empty
                    when the nav list is short. */}
                <div className="mt-auto flex flex-col gap-2 p-4">
                  {signedIn ? (
                    <Button asChild><Link href="/account">My account</Link></Button>
                  ) : (
                    <>
                      <Button asChild><Link href="/register">Sign up</Link></Button>
                      <Button asChild variant="outline"><Link href="/login">Sign in</Link></Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
