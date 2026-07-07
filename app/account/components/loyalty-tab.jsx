"use client";

import { useEffect, useState } from "react";
import { Loader2, Gift, TrendingUp, Star } from "lucide-react";
import { getMyLoyalty } from "../../lib/api";
import { Button } from "../../components/ui/button";

export function LoyaltyTab({ user }) {
  const [loyalty, setLoyalty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.accessToken) return;
    setLoading(true);
    getMyLoyalty(user.accessToken)
      .then(setLoyalty)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const points = loyalty?.balancePoints || 0;
  const tier = points >= 1000 ? "Gold" : points >= 500 ? "Silver" : "Bronze";
  const nextTierPoints = tier === "Gold" ? 0 : tier === "Silver" ? 500 : 1000;
  const pointsToNextTier = Math.max(0, nextTierPoints - points);

  return (
    <div className="space-y-6">
      {/* Current Points */}
      <div className="rounded-xl border-2 border-primary bg-primary/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-muted-foreground">Available Points</p>
            <p className="mt-2 text-4xl font-black text-primary">{points.toLocaleString()}</p>
            <p className="mt-2 text-sm text-muted-foreground">≈ £{(points / 100).toFixed(2)} value</p>
          </div>
          <Gift className="h-12 w-12 text-primary opacity-20" />
        </div>
      </div>

      {/* Tier Status */}
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm font-bold uppercase text-muted-foreground">Your Tier</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-2xl font-black text-foreground">{tier}</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <Star key={i} className={`h-5 w-5 ${i <= (tier === "Gold" ? 3 : tier === "Silver" ? 2 : 1) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
            ))}
          </div>
        </div>
        {pointsToNextTier > 0 && (
          <>
            <p className="mt-3 text-xs text-muted-foreground">{pointsToNextTier} points to {tier === "Silver" ? "Gold" : "Silver"}</p>
            <div className="mt-2 h-2 rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (points / nextTierPoints) * 100)}%` }} />
            </div>
          </>
        )}
      </div>

      {/* Benefits */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-black text-foreground">How It Works</h3>
        <div className="mt-4 space-y-3">
          <div className="flex gap-3">
            <TrendingUp className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-foreground">1 point per £1 spent</p>
              <p className="text-xs text-muted-foreground">Earn automatically on every purchase</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Gift className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-foreground">Redeem anytime</p>
              <p className="text-xs text-muted-foreground">Use points for discounts at checkout</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Star className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-foreground">Tier bonuses</p>
              <p className="text-xs text-muted-foreground">Gold tier: 2x points + early access</p>
            </div>
          </div>
        </div>
      </div>

      {/* Redeem Button */}
      {points >= 100 && (
        <Button className="w-full" size="lg">
          Redeem {points} Points
        </Button>
      )}
    </div>
  );
}
