import Link from "next/link";
import { footerLinks, siteNav, supportLinks } from "../../siteData";
import { BrandMark } from "./brand-mark";
import { Badge } from "../ui/badge";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-surface-dark text-surface-dark-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <BrandMark inverse />
          <p className="mt-5 max-w-sm text-sm leading-7 text-surface-dark-muted">
            Regulated UK vape retail: UK-made e-liquids, authentic hardware, coils, CBD, loyalty
            rewards, tracked delivery, and age-aware checkout.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge variant="default">18+ retail</Badge>
            <Badge className="bg-white/10 text-surface-dark-foreground">UK made e-liquids</Badge>
          </div>
        </div>

        <FooterColumn title="Shop" links={siteNav} />
        <FooterColumn title="Company" links={footerLinks} />

        <div>
          <h3 className="text-xs font-black uppercase tracking-wide text-primary">Support</h3>
          <div className="mt-4 grid gap-2 text-sm text-surface-dark-muted">
            {supportLinks.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-surface-dark-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs font-bold text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Phoenix Vapers Limited. Nicotine is addictive.</span>
          <span>Peterborough, United Kingdom · GBP · UK VAT included</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-wide text-primary">{title}</h3>
      <div className="mt-4 grid gap-2">
        {links.map((item) => (
          <Link
            key={item.label}
            className="text-sm text-surface-dark-muted transition hover:text-surface-dark-foreground"
            href={item.href}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
