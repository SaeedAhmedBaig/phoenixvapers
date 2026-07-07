"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { cn } from "../../lib/utils";

export function Command({ className, ...props }) {
  return (
    <CommandPrimitive
      className={cn("flex h-full w-full flex-col overflow-hidden rounded-xl bg-card text-card-foreground", className)}
      {...props}
    />
  );
}

export function CommandInput({ className, ...props }) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-5">
      <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
      <CommandPrimitive.Input
        className={cn(
          "flex h-14 w-full bg-transparent text-base font-bold outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function CommandList({ className, ...props }) {
  return (
    <CommandPrimitive.List className={cn("max-h-[60vh] overflow-y-auto overflow-x-hidden p-2", className)} {...props} />
  );
}

export function CommandEmpty(props) {
  return <CommandPrimitive.Empty className="px-4 py-8 text-center text-sm font-bold text-muted-foreground" {...props} />;
}

export function CommandGroup({ className, ...props }) {
  return (
    <CommandPrimitive.Group
      className={cn(
        "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-black [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function CommandItem({ className, ...props }) {
  return (
    <CommandPrimitive.Item
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-3 rounded-2xl px-3 py-2.5 text-sm outline-none transition-colors data-[selected=true]:bg-secondary data-[selected=true]:text-secondary-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
