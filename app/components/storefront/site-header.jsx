"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Menu, Search, ShoppingBag, UserCheck } from "lucide-react";
import { useCart } from "../../lib/store";
import { siteNav } from "../../siteData";
import { BrandMark } from "./brand-mark";
import { ThemeToggle } from "./theme-toggle";
import { SearchCommand } from "./search-command";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "../ui/sheet";

export function SiteHeader() {
  const { count, openDrawer, ready } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <div className="border-b border-border bg-card text-foreground dark:bg-foreground/5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-1 px-4 py-2 text-center text-xs font-bold sm:justify-between">
          <span className="inline-flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-primary" /> Adults 18+ only
          </span>
          <span className="hidden items-center gap-1.5 sm:inline-flex">
            Free Royal Mail Tracked 24 over £30
          </span>
          <Link className="font-black text-primary transition hover:opacity-80" href="/safety">
            Compliance standards
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3.5">
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <BrandMark />

          <nav className="mx-auto hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {siteNav.map((item) => (
              <Link
                key={item.label}
                className="rounded-lg px-3 py-2 text-sm font-bold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button variant="outline" size="icon" onClick={() => setSearchOpen(true)} className="sm:hidden" aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setSearchOpen(true)} className="hidden sm:inline-flex">
              <Search className="h-4 w-4" /> Search products
            </Button>
            <ThemeToggle className="hidden md:inline-flex" />
            <Button variant="inverse" onClick={openDrawer} className="relative" aria-label="Open basket">
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
      </header>

      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
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
