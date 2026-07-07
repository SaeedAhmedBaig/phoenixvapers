"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "../../lib/store";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

export function AddToCartButton({
  product,
  strength,
  qty = 1,
  variant = "inverse",
  size = "default",
  compact = false,
  className,
}) {
  const { addItem } = useCart();
  const [state, setState] = useState("idle");
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function onClick() {
    if (product.stockStatus === "out") return;
    setState("loading");
    try {
      await addItem(product, { strength, qty });
      setState("added");
      toast.success(`${product.name} added to basket`);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setState("idle"), 1600);
    } catch {
      setState("idle");
      toast.error("Couldn't add that item — please try again");
    }
  }

  const disabled = product.stockStatus === "out" || state === "loading";

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={cn(compact && "px-4", className)}
      aria-label={`Add ${product.name} to basket`}
    >
      {state === "loading" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : state === "added" ? (
        <Check className="h-4 w-4" />
      ) : (
        <ShoppingBag className="h-4 w-4" />
      )}
      {product.stockStatus === "out" ? "Out of stock" : compact ? "Add" : state === "added" ? "Added" : "Add to basket"}
    </Button>
  );
}
