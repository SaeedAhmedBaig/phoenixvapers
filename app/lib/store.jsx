"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  DELIVERY_FEE,
  FREE_SHIPPING_THRESHOLD,
  POINTS_PER_POUND,
} from "./utils";

const CART_KEY = "pv-cart-v1";
const AGE_KEY = "pv-age-verified-v1";

/* -------------------------------------------------------------------------- */
/*  Cart                                                                        */
/* -------------------------------------------------------------------------- */

const CartContext = createContext(null);

function lineId(slug, strength) {
  return strength ? `${slug}::${strength}` : slug;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage after mount to keep SSR markup stable.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore malformed storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      /* storage may be unavailable */
    }
  }, [items, ready]);

  function addItem(product, { strength, qty = 1 } = {}) {
    const chosen = strength ?? product.strength ?? null;
    const id = lineId(product.slug, chosen);
    setItems((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) =>
          item.id === id ? { ...item, qty: item.qty + qty } : item,
        );
      }
      return [
        ...prev,
        {
          id,
          slug: product.slug,
          name: product.name,
          brand: product.brand,
          category: product.category,
          format: product.format,
          strength: chosen,
          price: product.price,
          compareAt: product.compareAt ?? null,
          badge: product.badge ?? null,
          qty,
        },
      ];
    });
    setDrawerOpen(true);
  }

  function updateQty(id, qty) {
    setItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: Math.max(0, qty) } : item))
        .filter((item) => item.qty > 0),
    );
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function clearCart() {
    setItems([]);
  }

  const derived = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const count = items.reduce((sum, item) => sum + item.qty, 0);
    const qualifies = subtotal >= FREE_SHIPPING_THRESHOLD;
    const delivery = subtotal === 0 || qualifies ? 0 : DELIVERY_FEE;
    const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
    const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
    const points = Math.floor(subtotal * POINTS_PER_POUND);
    return {
      subtotal,
      count,
      delivery,
      total: subtotal + delivery,
      remaining,
      progress,
      points,
      qualifiesForFreeShipping: qualifies,
    };
  }, [items]);

  const value = {
    items,
    ready,
    drawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
    addItem,
    updateQty,
    removeItem,
    clearCart,
    ...derived,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

/* -------------------------------------------------------------------------- */
/*  Age verification                                                            */
/* -------------------------------------------------------------------------- */

const AgeContext = createContext(null);

export function AgeProvider({ children }) {
  const [verified, setVerified] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setVerified(window.localStorage.getItem(AGE_KEY) === "true");
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  function confirm() {
    try {
      window.localStorage.setItem(AGE_KEY, "true");
    } catch {
      /* ignore */
    }
    setVerified(true);
  }

  return (
    <AgeContext.Provider value={{ verified, ready, confirm }}>
      {children}
    </AgeContext.Provider>
  );
}

export function useAge() {
  const ctx = useContext(AgeContext);
  if (!ctx) throw new Error("useAge must be used within AgeProvider");
  return ctx;
}
