import Link from "next/link";
import {
  footerLinks,
  merchandisingHighlights,
  siteNav,
  supportLinks,
} from "./siteData";

export function AnnouncementBar() {
  return (
    <section className="announcement" aria-label="Age and delivery notice">
      <p>Adults 18+ only. Free Royal Mail Tracked 24 delivery over £30.</p>
      <Link href="/safety">View safety standards</Link>
    </section>
  );
}

export function BrandMark() {
  return (
    <Link className="brandMark" href="/" aria-label="Phoenix Vapers home">
      <span className="brandIcon" aria-hidden="true">
        PV
      </span>
      <span>
        <strong>Phoenix Vapers</strong>
        <small>UK e-liquids, hardware & CBD</small>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <>
      <AnnouncementBar />
      <header className="siteHeader storefrontHeader">
        <BrandMark />

        <nav aria-label="Primary navigation">
          {siteNav.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="headerActions">
          <Link className="ghostButton" href="/loyalty">
            Rewards
          </Link>
          <Link className="headerCta" href="/cart">
            Cart
          </Link>
        </div>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <div>
        <BrandMark />
        <p>
          Head Office: 1 The Manor Grove Centre, Vicarage Farm Road, Boongate,
          Peterborough, PE1 5UH, United Kingdom.
        </p>
      </div>
      <div>
        <h3>Shop</h3>
        {siteNav.map((item) => (
          <Link key={item.label} href={item.href}>
            {item.label}
          </Link>
        ))}
      </div>
      <div>
        <h3>Company</h3>
        {footerLinks.map((item) => (
          <Link key={item.label} href={item.href}>
            {item.label}
          </Link>
        ))}
      </div>
      <div>
        <h3>Support</h3>
        {supportLinks.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </footer>
  );
}

export function SectionHeader({ eyebrow, title, text, action, href }) {
  return (
    <div className="sectionHeader">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {text ? <p>{text}</p> : null}
      </div>
      {action && href ? (
        <Link className="secondaryButton" href={href}>
          {action}
        </Link>
      ) : null}
    </div>
  );
}

export function ProductCard({ product }) {
  return (
    <article className="productCard">
      <Link className="productVisual" href={`/product/${product.slug}`}>
        <span>{product.brand.slice(0, 2).toUpperCase()}</span>
        <small>{product.badge}</small>
      </Link>
      <div className="productBody">
        <div className="productMeta">
          <span>{product.brand}</span>
          <span>{product.rating} ★</span>
        </div>
        <h3>
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <p>{product.description}</p>
        <div className="tagRow">
          {product.notes.map((note) => (
            <span key={note}>{note}</span>
          ))}
        </div>
        <div className="productFooter">
          <div>
            <strong>£{product.price.toFixed(2)}</strong>
            {product.compareAt ? <small>£{product.compareAt.toFixed(2)}</small> : null}
          </div>
          <Link className="miniButton" href="/cart">
            Add
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }) {
  return (
    <div className="productGrid">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}

export function CategoryTile({ category }) {
  return (
    <Link className="categoryTile" href={`/${category.slug}`}>
      <span>{category.count}</span>
      <h3>{category.title}</h3>
      <p>{category.description}</p>
      <strong>{category.accent}</strong>
    </Link>
  );
}

export function StatsGrid({ stats }) {
  if (!stats?.length) {
    return null;
  }

  return (
    <div className="storeStats">
      {stats.map(([value, label]) => (
        <article key={`${value}-${label}`}>
          <strong>{value}</strong>
          <span>{label}</span>
        </article>
      ))}
    </div>
  );
}

export function PromoStrip() {
  return (
    <div className="promoStrip">
      {merchandisingHighlights.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

export function NewsletterPanel() {
  return (
    <section className="newsletter storeNewsletter">
      <div>
        <p className="eyebrow">Newsletter</p>
        <h2>New flavours, bundle offers, and store updates.</h2>
        <p>
          Subscribe for launches, loyalty offers, and shopping guidance. Customers
          should be told they can unsubscribe at any time.
        </p>
      </div>
      <form>
        <label htmlFor="newsletter-email">Email address</label>
        <div>
          <input id="newsletter-email" type="email" placeholder="you@example.com" />
          <button type="submit">Subscribe</button>
        </div>
      </form>
    </section>
  );
}

export function StoreShell({ children }) {
  return (
    <main>
      <SiteHeader />
      {children}
      <NewsletterPanel />
      <SiteFooter />
    </main>
  );
}
