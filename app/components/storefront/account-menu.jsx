"use client";

import Link from "next/link";
import { LogOut, User, ShieldCheck, Heart, FileText } from "lucide-react";
import { useUser } from "../../lib/user-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

export function AccountMenu() {
  const { user, logout } = useUser();

  if (!user) return null;

  const isAdmin = ["super-admin", "staff", "brand-partner"].includes(user.role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-bold">{user.email}</DropdownMenuLabel>
        <DropdownMenuLabel className="text-xs text-muted-foreground capitalize">{user.role}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Customer links */}
        {user.role === "customer" && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/account/orders" className="cursor-pointer">
                <FileText className="h-4 w-4" />
                My Orders
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/account/loyalty" className="cursor-pointer">
                <Heart className="h-4 w-4" />
                Loyalty Points
              </Link>
            </DropdownMenuItem>
          </>
        )}

        {/* Admin links */}
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin" className="cursor-pointer">
                <ShieldCheck className="h-4 w-4" />
                Admin Console
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
