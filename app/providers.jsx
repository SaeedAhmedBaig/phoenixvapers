"use client";

import { AgeProvider, CartProvider } from "./lib/store";
import { AgeGate, MiniCartDrawer, ProductDataIsland } from "./interactive";
import { products } from "./siteData";

export function Providers({ children }) {
  return (
    <AgeProvider>
      <CartProvider>
        <ProductDataIsland products={products} />
        {children}
        <MiniCartDrawer />
        <AgeGate />
      </CartProvider>
    </AgeProvider>
  );
}
