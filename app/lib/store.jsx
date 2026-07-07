"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  addCartItem,
  clearCart as apiClearCart,
  getCart,
  recordAgeVerification,
  removeCartItem,
  updateCartItem,
} from "./api";

const AGE_SUBJECT_KEY = "pv-age-subject-id";
const AGE_VERIFIED_KEY = "pv-age-verified-v1";

const EMPTY_CART = {
  items: [],
  subtotalMinor: 0,
  discountMinor: 0,
  appliedPromotions: [],
  deliveryMinor: 0,
  shippingMethod: undefined,
  totalMinor: 0,
  freeShippingThresholdMinor: 3000,
  freeShippingRemainingMinor: 3000,
  pointsPreview: 0,
  vat: { rate: 0.2, netMinor: 0, vatMinor: 0 },
};

/* -------------------------------------------------------------------------- */
/*  Cart — server is the source of truth (products, prices, promotions,        */
/*  stock and delivery all live behind the API, never hard-coded here).       */
/* -------------------------------------------------------------------------- */

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(EMPTY_CART);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refresh = useCallback(async (shippingMethod) => {
    try {
      const view = await getCart(shippingMethod);
      setCart(view);
    } catch {
      setCart(EMPTY_CART);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addItem(product, { strength, qty = 1 } = {}) {
    const view = await addCartItem({ productSlug: product.slug, strength: strength ?? product.strength, qty });
    setCart(view);
    setDrawerOpen(true);
  }

  async function updateQty(itemId, qty) {
    const view = await updateCartItem(itemId, qty);
    setCart(view);
  }

  async function removeItem(itemId) {
    const view = await removeCartItem(itemId);
    setCart(view);
  }

  async function clearCart() {
    const view = await apiClearCart();
    setCart(view);
  }

  const count = cart.items.reduce((sum, item) => sum + item.qty, 0);

  const value = {
    ...cart,
    count,
    ready,
    drawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
    addItem,
    updateQty,
    removeItem,
    clearCart,
    refresh,
    qualifiesForFreeShipping: cart.freeShippingRemainingMinor === 0,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

/* -------------------------------------------------------------------------- */
/*  Age verification — recorded server-side (Compliance module) against a     */
/*  stable anonymous subject key, so checkout can enforce it independent of   */
/*  any single page load.                                                     */
/* -------------------------------------------------------------------------- */

const AgeContext = createContext(null);

function ensureSubjectKey() {
  let key = window.localStorage.getItem(AGE_SUBJECT_KEY);
  if (!key) {
    key = crypto.randomUUID();
    window.localStorage.setItem(AGE_SUBJECT_KEY, key);
  }
  return key;
}

export function AgeProvider({ children }) {
  const [verified, setVerified] = useState(false);
  const [ready, setReady] = useState(false);
  const [subjectKey, setSubjectKey] = useState(null);

  useEffect(() => {
    setSubjectKey(ensureSubjectKey());
    setVerified(window.localStorage.getItem(AGE_VERIFIED_KEY) === "true");
    setReady(true);
  }, []);

  async function confirm() {
    const key = subjectKey ?? ensureSubjectKey();
    try {
      await recordAgeVerification({ subjectKey: key, confirmed: true });
    } finally {
      window.localStorage.setItem(AGE_VERIFIED_KEY, "true");
      setVerified(true);
    }
  }

  return (
    <AgeContext.Provider value={{ verified, ready, confirm, subjectKey }}>{children}</AgeContext.Provider>
  );
}

export function useAge() {
  const ctx = useContext(AgeContext);
  if (!ctx) throw new Error("useAge must be used within AgeProvider");
  return ctx;
}
