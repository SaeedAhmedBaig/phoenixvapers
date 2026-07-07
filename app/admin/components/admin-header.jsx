"use client";

import { Menu, Search } from "lucide-react";
import { Button } from "../../components/ui/button";
import { ThemeToggle } from "../../components/storefront/theme-toggle";

export function AdminHeader({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/85 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex-1 flex items-center gap-4 md:gap-8">
          <div className="hidden sm:flex flex-1 items-center gap-2 max-w-xs">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Quick search…"
              className="w-full bg-transparent text-sm font-bold placeholder-muted-foreground outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden md:inline-flex" />
        </div>
      </div>
    </header>
  );
}
