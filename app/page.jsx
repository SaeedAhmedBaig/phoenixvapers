import Link from "next/link";
import {
  CategoryTile,
  ProductGrid,
  PromoStrip,
  SectionHeader,
  StatsGrid,
  StoreShell,
} from "./components";
import {
  categoryCards,
  featuredCollections,
  products,
  testimonials,
} from "./siteData";

const heroStats = [
  ["£30", "free Tracked 24 threshold"],
  ["18+", "age verified retail"],
  ["320+", "flavour-led products"],
  ["ISO", "quality-led operations"],
];

const featuredProducts = products.filter((product) =>
  ["new-arrivals", "best-sellers", "deals"].includes(product.collection),
);

const starterProducts = products.filter((product) =>
  ["starter-kits", "essentials"].includes(product.collection),
);

export default function Home() {
  return (
    <StoreShell>
      <section className="storeHero">
        <div className="storeHeroCopy">
          <p className="eyebrow">Phoenix Vapers</p>
          <h1>UK vaping made easier to shop, safer to trust, and faster to reorder.</h1>
          <p className="heroLead">
            Explore UK-made e-liquids, authentic hardware, replacement coils, CBD,
            loyalty rewards, and delivery promises in one full-scale ecommerce
            storefront.
          </p>
          <div className="heroActions">
            <Link className="primaryButton" href="/shop">
              Shop All Products
            </Link>
            <Link className="secondaryButton" href="/faq">
              Help Me Choose
            </Link>
          </div>
          <StatsGrid stats={heroStats} />
        </div>

        <aside className="heroCommerceCard" aria-label="Featured ecommerce offer">
          <span className="pill">Bundle Deal</span>
          <h2>4 for £11 on selected 10ml favourites.</h2>
          <p>
            Build a repeat basket with Bar Wars and FiftyFifty Smooth, then unlock
            premium Royal Mail Tracked 24 delivery over £30.
          </p>
          <div className="priceCallout">
            <strong>£11</strong>
            <span>selected multipacks</span>
          </div>
          <Link className="primaryButton" href="/deals">
            Shop Deals
          </Link>
        </aside>
      </section>

      <PromoStrip />

      <section className="storeSection">
        <SectionHeader
          eyebrow="Shop By Category"
          title="Clear buying paths for every customer type."
          text="The storefront starts with range, trust, and guidance, so new and returning shoppers can move quickly."
          action="View Shop"
          href="/shop"
        />
        <div className="categoryShowcase">
          {categoryCards.map((category) => (
            <CategoryTile key={category.slug} category={category} />
          ))}
        </div>
      </section>

      <section className="storeSection">
        <SectionHeader
          eyebrow="Featured Products"
          title="Launches, best sellers, and deal-led products."
          text="Product cards include price, badge, format, rating, flavour notes, and ecommerce calls to action."
          action="Shop New Arrivals"
          href="/new-arrivals"
        />
        <ProductGrid products={featuredProducts} />
      </section>

      <section className="splitMerch">
        <div>
          <p className="eyebrow">Find The Right Vape</p>
          <h2>Guided shopping instead of overwhelming filters.</h2>
          <p>
            Match customers by draw style, nicotine format, flavour family, and
            device compatibility. This gives beginners a clear path while keeping
            advanced users close to coils, shortfills, and hardware.
          </p>
          <Link className="primaryButton" href="/faq">
            Open Buying Guide
          </Link>
        </div>
        <div className="finderSteps">
          {[
            "Choose MTL or DTL draw style",
            "Pick freebase, nic salt, shortfill, or CBD",
            "Match coil resistance to device",
            "Use loyalty points on repeat baskets",
          ].map((step, index) => (
            <article key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="storeSection">
        <SectionHeader
          eyebrow="Starter And Essential Reorders"
          title="Make repeat purchases feel effortless."
          text="A proper ecommerce frontend needs fast paths to starter kits, pods, replacement coils, and everyday essentials."
          action="Shop Coils"
          href="/coils"
        />
        <ProductGrid products={starterProducts} />
      </section>

      <section className="collectionBand">
        {featuredCollections.map((collection) => (
          <Link key={collection.slug} href={`/${collection.slug}`}>
            <span>Collection</span>
            <h3>{collection.title}</h3>
            <p>{collection.description}</p>
          </Link>
        ))}
      </section>

      <section className="storeSection">
        <SectionHeader
          eyebrow="Trust First"
          title="Safety, service, delivery, and loyalty are visible before checkout."
          text="The page now surfaces compliance and support details where shoppers actually make decisions."
        />
        <div className="trustGrid polishedTrust">
          {[
            ["UK Manufactured", "E-liquids produced in the UK with chemist and food-scientist oversight."],
            ["EL-Science Backed", "Product Risk Assessments and safety-led messaging are promoted early."],
            ["Tracked Delivery", "Same-day weekday dispatch before 2pm and free Tracked 24 over £30."],
            ["Rewards Built In", "1 point per £1 spent, 100 points for £1 off, plus registration bonus."],
          ].map(([title, text]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="reviewBand">
        {testimonials.map((testimonial) => (
          <figure key={testimonial.author}>
            <blockquote>{testimonial.quote}</blockquote>
            <figcaption>{testimonial.author}</figcaption>
          </figure>
        ))}
      </section>
    </StoreShell>
  );
}
