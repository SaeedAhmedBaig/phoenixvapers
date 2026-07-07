import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground! shadow-sm hover:bg-primary-hover",
        secondary: "bg-secondary text-secondary-foreground! hover:bg-secondary/80",
        outline: "border border-border bg-card text-foreground! hover:border-primary hover:text-primary!",
        ghost: "text-foreground! hover:bg-secondary",
        destructive: "bg-destructive text-destructive-foreground! hover:opacity-90",
        link: "text-primary! underline-offset-4 hover:underline",
        inverse: "bg-foreground text-background! hover:opacity-90",
        outlineOnDark:
          "border border-surface-dark-border! bg-transparent text-surface-dark-foreground! hover:border-white/40 hover:bg-white/5",
        outlineInverse:
          "border border-background/25! bg-transparent text-background! hover:border-background/50 hover:bg-background/10",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-7 text-base",
        icon: "h-11 w-11 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export const Button = React.forwardRef(function Button(
  { className, variant, size, asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});
