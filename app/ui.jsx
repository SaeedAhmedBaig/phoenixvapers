import Link from "next/link";
import { cn } from "./lib/utils";

export function Badge({ children, tone = "dark", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em]",
        tone === "brand" && "bg-brand text-white",
        tone === "lime" && "bg-lime text-ink",
        tone === "dark" && "bg-ink text-white",
        tone === "soft" && "bg-soft text-ink",
        tone === "accent" && "bg-accent text-white",
        tone === "outline" && "border border-ink/15 bg-white/70 text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ButtonLink({ href, children, variant = "primary", className, ...rest }) {
  return (
    <Link className={buttonClasses(variant, className)} href={href} {...rest}>
      {children}
    </Link>
  );
}

export function buttonClasses(variant = "primary", className) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-black transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-50",
    variant === "primary" &&
      "bg-brand text-white shadow-lg shadow-brand/25 hover:bg-brand-dark hover:shadow-brand/30",
    variant === "dark" && "bg-ink text-white hover:bg-black",
    variant === "outline" &&
      "border border-ink/15 bg-white text-ink hover:border-brand hover:text-brand",
    variant === "lime" && "bg-lime text-ink hover:brightness-95",
    variant === "ghost" && "text-ink hover:bg-soft",
    className,
  );
}

export function SectionHeader({ eyebrow, title, text, action, href, align = "between" }) {
  return (
    <div
      className={cn(
        "mb-8 flex gap-5",
        align === "center"
          ? "mx-auto max-w-3xl flex-col items-center text-center"
          : "flex-col lg:flex-row lg:items-end lg:justify-between",
      )}
    >
      <div className={cn(align === "center" ? "" : "max-w-3xl")}>
        {eyebrow ? (
          <p className="text-xs font-black uppercase tracking-[0.2em] text-brand">{eyebrow}</p>
        ) : null}
        <h2 className="mt-2 text-balance text-3xl font-black tracking-[-0.05em] text-ink md:text-5xl">
          {title}
        </h2>
        {text ? <p className="mt-4 text-pretty text-base leading-8 text-muted">{text}</p> : null}
      </div>
      {action && href ? (
        <ButtonLink href={href} variant="outline">
          {action}
        </ButtonLink>
      ) : null}
    </div>
  );
}

export function StatsGrid({ stats }) {
  if (!stats?.length) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(([value, label]) => (
        <article
          key={`${value}-${label}`}
          className="rounded-3xl border border-line bg-white/80 p-5 backdrop-blur"
        >
          <strong className="block text-2xl font-black tracking-[-0.06em] text-ink">{value}</strong>
          <span className="mt-1 block text-sm font-bold text-muted">{label}</span>
        </article>
      ))}
    </div>
  );
}

export function Rating({ value, reviews, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-black text-ink",
        className,
      )}
    >
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-lime" aria-hidden="true">
        <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 15l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
      </svg>
      {value}
      {reviews != null ? <span className="font-bold text-muted">({reviews})</span> : null}
    </span>
  );
}
