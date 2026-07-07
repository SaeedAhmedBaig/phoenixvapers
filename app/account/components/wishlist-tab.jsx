"use client";

import { useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "../../components/ui/button";

export function WishlistTab({ user }) {
  const [wishlist] = useState([]);

  if (wishlist.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-lg font-bold text-foreground">No saved items yet</p>
        <p className="mt-2 text-sm text-muted-foreground">Click the heart icon on products to save them for later</p>
        <Button className="mt-6" asChild>
          <a href="/shop">Explore products</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {wishlist.map((item) => (
        <div key={item.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-foreground">{item.name}</h3>
            <Heart className="h-5 w-5 fill-destructive text-destructive flex-shrink-0" />
          </div>
          <p className="mt-2 text-lg font-black text-primary">£{(item.price / 100).toFixed(2)}</p>
          <Button className="mt-4 w-full" size="sm">
            <ShoppingBag className="h-4 w-4" />
            Add to Basket
          </Button>
        </div>
      ))}
    </div>
  );
}
