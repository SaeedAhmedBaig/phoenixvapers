"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster(props) {
  return (
    <Sonner
      className="toaster"
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            "rounded-2xl! border! border-border! bg-card! text-card-foreground! shadow-xl! font-bold!",
          description: "text-muted-foreground!",
          actionButton: "bg-primary! text-primary-foreground!",
          cancelButton: "bg-secondary! text-secondary-foreground!",
        },
      }}
      {...props}
    />
  );
}
