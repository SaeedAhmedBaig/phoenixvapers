"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
  UserCheck,
} from "lucide-react";
import { useCart } from "../../lib/store";
import { useUser } from "../../lib/user-store";
import { siteNav } from "../../siteData";
import { BrandMark } from "./brand-mark";
import { ThemeToggle } from "./theme-toggle";
import { SearchCommand } from "./search-command";
import { LoginDialog, SignupDialog } from "./auth-dialogs";
import { AccountMenu } from "./account-menu";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "../ui/sheet";

export function SiteHeader() {
  const { count, openDrawer, ready } = useCart();
  const { user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  function switchToSignup() {
    setLoginOpen(false);
    setSignupOpen(true);
  }
  function switchToLogin() {
    setSignupOpen(false);
    setLoginOpen(true);
  }

  return (
    <>
      {/* Announcement bar — trust signals */}
      <div className="bg-foreground text-background dark:bg-card dark:text-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-4 py-2 text-xs font-bold sm:justify-between">
          <span className="hidden items-center gap-1.5 sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Age-verified 18+ UK retailer
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-primary" />
            Free Royal Mail Tracked 24 over £30
          </span>
          <Link
            className="hidden items-center gap-1.5 transition hover:text-primary sm:inline-flex"
            href="/store-locator"
          >
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Find a store
          </Link>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4">
          {/* Row 1: logo · search · account/basket */}
          <div className="flex items-center gap-3 py-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <BrandMark />
            </div>

            {/* Search bar — prominent, center stage */}
            <button
              onClick={() => setSearchOpen(true)}
              className="group hidden flex-1 items-center gap-3 rounded-full border border-border bg-secondary/50 px-4 py-2.5 text-sm font-bold text-muted-foreground transition hover:border-primary/40 hover:bg-secondary sm:flex"
              aria-label="Search products"
            >
              <Search className="h-4 w-4 flex-shrink-0 transition group-hover:text-primary" />
              <span className="truncate">Search e-liquids, devices, brands…</span>
              <kbd className="ml-auto hidden rounded border border-border bg-card px-1.5 py-0.5 text-[0.65rem] font-black text-muted-foreground lg:inline">
                ⌘K
              </kbd>
            </button>

            {/* Right: search (mobile), theme, account, basket */}
            <div className="ml-auto flex items-center gap-1.5 sm:ml-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="sm:hidden"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Button>

              <ThemeToggle className="hidden md:inline-flex" />

              {user ? (
                <AccountMenu />
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLoginOpen(true)}
                    className="hidden sm:inline-flex"
                  >
                    <User className="h-4 w-4" />
                    Sign in
                  </Button>
                  <Button size="sm" onClick={() => setSignupOpen(true)} className="hidden sm:inline-flex">
                    Join
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setLoginOpen(true)}
                    className="sm:hidden"
                    aria-label="Sign in"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </>
              )}

              <Button
                variant="inverse"
                onClick={openDrawer}
                className="relative"
                aria-label={`Open basket${ready && count > 0 ? `, ${count} items` : ""}`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Basket</span>
                {ready && count > 0 ? (
                  <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[0.7rem] font-black text-primary-foreground">
                    {count}
                  </span>
                ) : null}
              </Button>
            </div>
          </div>

          {/* Row 2: category navigation */}
          <nav
            className="hidden items-center gap-1 overflow-x-auto pb-2 lg:flex"
            aria-label="Primary navigation"
          >
            {siteNav.map((item) => (
              <Link
                key={item.label}
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-bold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} onSwitchToSignup={switchToSignup} />
      <SignupDialog open={signupOpen} onOpenChange={setSignupOpen} onSwitchToLogin={switchToLogin} />
    </>
  );
}

function MobileMenu({ open, onOpenChange }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Menu" className="sm:max-w-xs">
        <SheetHeader onClose={() => onOpenChange(false)}>
          <BrandMark compact />
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="grid gap-1">
            {siteNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className="flex items-center justify-between rounded-lg px-4 py-3 text-base font-black text-foreground transition hover:bg-secondary"
              >
                {item.label}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </nav>
        <div className="border-t border-border p-4">
          <div className="flex items-start justify-between gap-3 rounded-lg bg-secondary p-4 text-sm font-bold leading-6 text-foreground">
            <span className="min-w-0 flex-1">
              <UserCheck className="mb-1.5 h-5 w-5 text-primary" />
              <br />
              Age-verified 18+ retail. Free Tracked 24 over £30.
            </span>
            <ThemeToggle className="shrink-0" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
