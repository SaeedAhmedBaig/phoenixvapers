"use client";

import { AgeProvider, CartProvider } from "./lib/store";
import { ThemeProvider } from "./lib/theme";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={150}>
        <AgeProvider>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </AgeProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
