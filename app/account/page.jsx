"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "../lib/user-store";
import { StoreShell } from "../components/storefront/store-shell";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { FileText, Heart, LogOut, Settings } from "lucide-react";
import { OrdersTab } from "./components/orders-tab";
import { LoyaltyTab } from "./components/loyalty-tab";
import { WishlistTab } from "./components/wishlist-tab";
import { SettingsTab } from "./components/settings-tab";

export default function AccountPage() {
  const router = useRouter();
  const { user, accessToken, logout, ready } = useUser();

  useEffect(() => {
    if (ready && !user) {
      router.replace("/");
    }
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <StoreShell>
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading account...</p>
        </div>
      </StoreShell>
    );
  }

  return (
    <StoreShell newsletter={false}>
      <section className="mx-auto max-w-4xl px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">My Account</h1>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Button variant="outline" onClick={logout} size="sm">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="orders" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="loyalty" className="gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Loyalty</span>
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Saved</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-6">
              <OrdersTab accessToken={accessToken} />
            </TabsContent>

            <TabsContent value="loyalty" className="mt-6">
              <LoyaltyTab accessToken={accessToken} />
            </TabsContent>

            <TabsContent value="wishlist" className="mt-6">
              <WishlistTab user={user} />
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <SettingsTab user={user} />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </StoreShell>
  );
}
