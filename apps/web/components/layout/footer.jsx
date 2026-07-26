import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { CATEGORIES } from "@/lib/categories";

export function Footer() {
  return (
    <footer className="bg-chrome text-chrome-fg mt-auto border-t-4 border-primary">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="font-display text-xl font-medium">Phoenix Vapers</p>
            <p className="text-chrome-fg/70 mt-3 max-w-sm text-sm leading-relaxed">
              Compliance-first UK vaping. UK-made, batch-tested, duty-inclusive. Calm, honest, evidence-forward.
            </p>
            <p className="text-chrome-fg/50 mt-4 font-mono text-xs">Peterborough · United Kingdom</p>
          </div>
          <div>
            <p className="text-chrome-fg/50 text-xs font-semibold uppercase tracking-wider">Shop</p>
            <ul className="mt-4 space-y-2.5">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link href={`/c/${c.slug}`} className="text-chrome-fg/80 hover:text-chrome-fg text-sm transition-colors">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-chrome-fg/50 text-xs font-semibold uppercase tracking-wider">Trust</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/our-standard" className="text-chrome-fg/80 hover:text-chrome-fg">Our Standard</Link></li>
              <li><Link href="/guidance" className="text-chrome-fg/80 hover:text-chrome-fg">New to vaping</Link></li>
              <li><Link href="/guidance/strength" className="text-chrome-fg/80 hover:text-chrome-fg">Strength guide</Link></li>
              <li><Link href="/guidance/flavours" className="text-chrome-fg/80 hover:text-chrome-fg">Flavour finder</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-chrome-fg/50 text-xs font-semibold uppercase tracking-wider">Account & trade</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/account" className="text-chrome-fg/80 hover:text-chrome-fg">My account</Link></li>
              <li><Link href="/login" className="text-chrome-fg/80 hover:text-chrome-fg">Sign in</Link></li>
              <li><Link href="/register" className="text-chrome-fg/80 hover:text-chrome-fg">Create account</Link></li>
              <li><Link href="/wholesale" className="text-chrome-fg/80 hover:text-chrome-fg">Wholesale</Link></li>
            </ul>
          </div>
        </div>

        <Separator className="bg-chrome-fg/15 my-10" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-chrome-fg/50 text-xs">
            © {new Date().getFullYear()} Phoenix Vapers Limited · 18+ only
          </p>
          <p className="text-chrome-fg/40 max-w-xl text-[11px] leading-relaxed">
            Contains nicotine. An addictive substance. This website is intended for adults aged 18 and over who are existing smokers or vapers.
          </p>
        </div>
      </div>
    </footer>
  );
}
