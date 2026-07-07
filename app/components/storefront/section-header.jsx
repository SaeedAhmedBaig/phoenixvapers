import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import Link from "next/link";

export function SectionHeader({ eyebrow, title, text, action, href, align = "between", className }) {
  return (
    <div
      className={cn(
        "mb-8 flex gap-5",
        align === "center" ? "mx-auto max-w-2xl flex-col items-center text-center" : "flex-col lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className={align === "center" ? "" : "max-w-2xl"}>
        {eyebrow ? <p className="text-xs font-black uppercase tracking-wide text-primary">{eyebrow}</p> : null}
        <h2 className="mt-2 text-balance text-3xl font-black tracking-tight text-foreground md:text-4xl">{title}</h2>
        {text ? <p className="mt-3 text-pretty text-base leading-7 text-muted-foreground">{text}</p> : null}
      </div>
      {action && href ? (
        <Button variant="outline" asChild className="shrink-0">
          <Link href={href}>{action}</Link>
        </Button>
      ) : null}
    </div>
  );
}
