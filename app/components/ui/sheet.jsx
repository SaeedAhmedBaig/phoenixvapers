"use client";

import * as React from "react";
import { Drawer } from "vaul";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * vaul-based sheet: slides from the right on desktop/tablet widths, from the
 * bottom on narrow (mobile) widths, matching native app-store bottom-sheet
 * conventions instead of a fixed side panel that feels cramped on phones.
 */
export function Sheet({ children, ...props }) {
  const [isNarrow, setIsNarrow] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <Drawer.Root direction={isNarrow ? "bottom" : "right"} {...props}>
      {children}
    </Drawer.Root>
  );
}

export const SheetTrigger = Drawer.Trigger;
export const SheetClose = Drawer.Close;

export function SheetContent({ className, children, title, description }) {
  return (
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm" />
      <Drawer.Content
        className={cn(
          "fixed z-50 flex flex-col bg-card text-card-foreground outline-none",
          "inset-x-0 bottom-0 max-h-[88vh] rounded-t-xl border-t border-border",
          "sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:w-full sm:max-w-md sm:max-h-full sm:rounded-none sm:rounded-l-xl sm:border-l sm:border-t-0",
          className,
        )}
      >
        <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-border sm:hidden" />
        <Drawer.Title className="sr-only">{title || "Panel"}</Drawer.Title>
        {description ? <Drawer.Description className="sr-only">{description}</Drawer.Description> : null}
        {children}
      </Drawer.Content>
    </Drawer.Portal>
  );
}

export function SheetHeader({ className, onClose, children }) {
  return (
    <div className={cn("flex items-center justify-between border-b border-border px-5 py-4", className)}>
      {children}
      {onClose ? (
        <Drawer.Close
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Drawer.Close>
      ) : null}
    </div>
  );
}
