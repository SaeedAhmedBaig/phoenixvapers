"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Password field with a show/hide reveal toggle — standard on modern
 * sign-in/sign-up forms. Renders a real <input name=…> so it submits
 * normally inside a server-action <form>; only the input TYPE is toggled
 * client-side, the value never leaves the field.
 */
function PasswordInput({ className, ...props }) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        data-slot="password-input"
        className={cn(
          "h-10 w-full min-w-0 rounded-md border border-input bg-card py-1 pl-3 pr-10 text-base text-foreground shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input dark:text-foreground",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          className,
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        tabIndex={-1}
        className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex w-10 items-center justify-center"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export { PasswordInput };
