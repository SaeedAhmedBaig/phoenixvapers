import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Class-name combiner used by every shadcn/ui component: clsx for
 * conditionals, tailwind-merge so later utilities win over earlier ones.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
