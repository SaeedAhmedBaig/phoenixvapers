import Link from "next/link";
import { footerLinks, siteNav, supportLinks } from "./siteData";

const navItems = [
  ...siteNav,
];

const heroStats = [
  { value: "UK", label: "manufactured e-liquids" },
  { value: "18+", label: "age verified retail" },
  { value: "£30", label: "free Tracked 24 shipping" },
];

const categories = [
  {
    title: "E-Liquids",
    text: "TPD 10ml, shortfills, nic salts, nicotine shots, fruit, menthol, dessert, tobacco, and flavourless options.",
    meta: "320+ flavour-led products",
  },
  {
    title: "Hardware",
    text: "Starter kits, pod kits, sub-ohm kits, pen kits, tanks, mods, and authentic devices from trusted vape brands.",
    meta: "Beginner to advanced",
  },
  {
    title: "Coils & Pods",
    text: "Replacement coils, pods, cotton, wire, and resistances from 0.14Ω cloud builds to 2.0Ω tight MTL draws.",
    meta: "MTL and DTL support",
  },
  {
    title: "CBD",
    text: "CBD tinctures, edibles, dry herb options, and CBD vape devices from Hemp Life, Just CBD, Professor Herb, and Hurb Breeze.",
    meta: "150mg to 3000mg",
  },
];

const featuredRanges = [
  "Cedar Reserve",
  "Brain Freeze",
  "Bar Wars",
  "FiftyFifty Smooth",
  "Fused",
  "Candy Land",
  "Bake My Day",
  "Crispy Cloud",
];

const trustCards = [
  {
    title: "Batch analysed before sale",
    text: "Phoenix Vapers works with qualified chemists and food scientists, with e-liquid production held to commercial laboratory standards.",
  },
  {
    title: "EL-Science risk assessments",
    text: "EL-Science supports Phoenix e-liquid safety with full Product Risk Assessments and more than £2m invested in safety infrastructure.",
  },
  {
    title: "Authentic products only",
    text: "No clones or replica hardware. The catalogue focuses on genuine devices, batteries, coils, and accessories.",
  },
  {
    title: "ISO and SSL confidence",
    text: "ISO 9001:2015 quality management and Comodo SSL trust marks are promoted early instead of being buried in the footer.",
  },
];

const offerCards = [
  {
    label: "Bundle Deal",
    title: "4 for £11 favourites",
    text: "Bring Bar Wars and FiftyFifty Smooth bundle pricing forward with a clear promotional area.",
  },
  {
    label: "New Arrival",
    title: "Cedar Reserve launches",
    text: "Give new flavour drops a written callout with urgency copy, not only rotating banner artwork.",
  },
  {
    label: "Coming Soon",
    title: "Fan favourites queue",
    text: "Use the homepage to preview launches, seasonal blends, coils, and shortfills in one curated strip.",
  },
];

const guideSteps = [
  "Choose your style: MTL for cigarette-like draw, DTL for open airflow and bigger vapour.",
  "Pick nicotine format: freebase 10ml, smoother nic salts, or 0mg shortfills with optional shots.",
  "Match your flavour: fruit, ice, sweets, desserts, tobacco, drinks, or simple flavourless base.",
  "Check your device: pod kits and starter kits for simplicity, sub-ohm kits for higher VG shortfills.",
];

const reviews = [
  {
    quote:
      "Helpful guidance matters when customers are moving from smoking to vaping. Put expert advice and store support above the fold.",
    author: "Retail-first service",
  },
  {
    quote:
      "Show safety credentials early: UK manufacture, chemist oversight, EL-Science assessments, ISO quality, and secure checkout.",
    author: "Trust-first shopping",
  },
  {
    quote:
      "Use reviews, rewards, and clear delivery promises to make the buying decision feel simple for returning customers.",
    author: "Conversion audit insight",
  },
];

export default function Home() {
  return (
    <main>
      <section className="announcement" aria-label="Age and delivery notice">
        <p>For adults 18+ only. Free Royal Mail Tracked 24 delivery over £30.</p>
        <Link href="/safety">View safety standards</Link>
      </section>

      <header className="siteHeader">
        <Link className="brandMark" href="/" aria-label="Phoenix Vapers home">
          <span className="brandIcon" aria-hidden="true">
            PV
          </span>
          <span>
            <strong>Phoenix Vapers</strong>
            <small>UK e-liquids, hardware & CBD</small>
          </span>
        </Link>

        <nav aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <a className="headerCta" href="#finder">
          Find My Vape
        </a>
      </header>

      <section className="hero">
        <div className="heroCopy">
          <p className="eyebrow">Phoenix eLiquids is now positioned for Phoenix Vapers</p>
          <h1>Trusted UK vaping, made simpler from first flavour to final checkout.</h1>
          <p className="heroLead">
            Shop UK-manufactured e-liquids, authentic hardware, coils, CBD, and
            rewards with clear guidance for beginners and advanced vapers alike.
          </p>

          <div className="heroActions">
            <Link className="primaryButton" href="/e-liquids">
              Shop E-Liquids
            </Link>
            <Link className="secondaryButton" href="/deals">
              View Deals
            </Link>
          </div>

          <div className="heroStats" aria-label="Phoenix Vapers highlights">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="heroPanel" aria-label="Featured product launch">
          <p className="pill">Just Launched</p>
          <h2>Cedar Reserve new flavour drop</h2>
          <p>
            Give high-converting launches text visibility with clear urgency,
            flavour positioning, and direct paths to 10ml, shortfill, and nic
            salt ranges.
          </p>
          <div className="flavourGrid">
            <span>Fruit</span>
            <span>Ice</span>
            <span>Dessert</span>
            <span>Tobacco</span>
          </div>
        </div>
      </section>

      <section className="trustStrip" id="safety" aria-label="Trust indicators">
        <span>UK manufactured</span>
        <span>TPD compliant 10ml</span>
        <span>EL-Science backed</span>
        <span>ISO 9001:2015</span>
        <span>Comodo SSL</span>
      </section>

      <section className="section" id="e-liquids">
        <div className="sectionIntro">
          <p className="eyebrow">Shop By Need</p>
          <h2>Everything customers need, without the old homepage guesswork.</h2>
          <p>
            The report called out a missing value proposition and unclear
            shopping routes. This landing page makes the core catalogue visible
            immediately.
          </p>
        </div>

        <div className="categoryGrid">
          {categories.map((category) => (
            <article className="categoryCard" key={category.title}>
              <p>{category.meta}</p>
              <h3>{category.title}</h3>
              <span>{category.text}</span>
              <Link href="/faq">Get guidance</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="splitSection" id="new-arrivals">
        <div>
          <p className="eyebrow">Fan Favourites & New Arrivals</p>
          <h2>Feature the house brands shoppers already recognise.</h2>
          <p>
            Cedar Reserve, Brain Freeze, Bar Wars, FiftyFifty Smooth, and
            Fused can act as faster paths into the catalogue while keeping the
            page useful for first-time visitors.
          </p>
        </div>
        <div className="rangeCloud" aria-label="Featured ranges">
          {featuredRanges.map((range) => (
            <span key={range}>{range}</span>
          ))}
        </div>
      </section>

      <section className="section muted" id="deals">
        <div className="sectionIntro">
          <p className="eyebrow">Offers That Stand Out</p>
          <h2>Bring bundles, new flavours, and urgency out of product tiles.</h2>
        </div>
        <div className="offerGrid">
          {offerCards.map((offer) => (
            <article key={offer.title} className="offerCard">
              <p>{offer.label}</p>
              <h3>{offer.title}</h3>
              <span>{offer.text}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="finder" id="finder">
        <div className="finderPanel">
          <p className="eyebrow">Beginner Finder</p>
          <h2>Choose the right product in four simple steps.</h2>
          <p>
            A guided path answers the FAQ gaps: nicotine strength, nic salts
            versus freebase, shortfills, coils, and device style.
          </p>
        </div>
        <ol>
          {guideSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="section" id="hardware">
        <div className="sectionIntro">
          <p className="eyebrow">Hardware, Coils & CBD</p>
          <h2>Support every vaping style with clear compatibility messaging.</h2>
          <p>
            The catalogue spans starter kits, pods, sub-ohm kits, mods,
            replacement coils, 18650 and 21700 batteries, chargers, CBD
            tinctures, edibles, and vape devices.
          </p>
        </div>
        <div className="specGrid">
          <article>
            <strong>81</strong>
            <span>MTL device and coil options</span>
          </article>
          <article>
            <strong>47</strong>
            <span>DTL device and coil options</span>
          </article>
          <article>
            <strong>0.14Ω-2.0Ω</strong>
            <span>coil resistance coverage</span>
          </article>
          <article>
            <strong>150mg-3000mg</strong>
            <span>CBD strength range</span>
          </article>
        </div>
      </section>

      <section className="section muted" id="trust">
        <div className="sectionIntro">
          <p className="eyebrow">Quality & Compliance</p>
          <h2>Trust signals are visible before checkout.</h2>
        </div>
        <div className="trustGrid">
          {trustCards.map((card) => (
            <article key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="logistics" id="store-finder">
        <div>
          <p className="eyebrow">Delivery & Returns</p>
          <h2>Clear service promises reduce support friction.</h2>
          <p>
            Orders placed before 2pm Monday to Friday dispatch the same day.
            Royal Mail Tracked 24 costs £3.99 or becomes free over £30 after
            discounts and points. Tracked 48 is £2.99.
          </p>
        </div>
        <div className="serviceCard">
          <h3>Fault-based returns</h3>
          <p>
            Customers email the order number and fault description, Phoenix
            tests returned items within three working days, then replaces
            confirmed faulty goods or provides an equal-or-greater substitute.
          </p>
        </div>
      </section>

      <section className="loyalty" id="loyalty">
        <div>
          <p className="eyebrow">Loyalty Programme</p>
          <h2>Earn 1 point per £1, redeem 100 points for £1 off.</h2>
          <p>
            New accounts receive 100 points, with no earning cap and no minimum
            redemption period. Points apply before the £30 free-shipping
            threshold is calculated.
          </p>
        </div>
        <div className="loyaltyCalc" aria-label="Example loyalty calculation">
          <span>Spend £50</span>
          <strong>50 points</strong>
          <span>£0.50 future saving</span>
        </div>
      </section>

      <section className="section" id="reviews">
        <div className="sectionIntro">
          <p className="eyebrow">Social Proof</p>
          <h2>Add review-style proof where the old homepage had none.</h2>
        </div>
        <div className="reviewGrid">
          {reviews.map((review) => (
            <figure key={review.author}>
              <blockquote>{review.quote}</blockquote>
              <figcaption>{review.author}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="newsletter">
        <div>
          <p className="eyebrow">Newsletter</p>
          <h2>Get new flavours, bundle offers, and store updates.</h2>
          <p>
            By subscribing, customers should be told they agree to receive
            Phoenix Vapers marketing and can unsubscribe at any time.
          </p>
        </div>
        <form>
          <label htmlFor="email">Email address</label>
          <div>
            <input id="email" type="email" placeholder="you@example.com" />
            <button type="submit">Subscribe</button>
          </div>
        </form>
      </section>

      <footer>
        <div>
          <Link className="brandMark" href="/" aria-label="Phoenix Vapers home">
            <span className="brandIcon" aria-hidden="true">
              PV
            </span>
            <span>
              <strong>Phoenix Vapers</strong>
              <small>Rise into better vaping</small>
            </span>
          </Link>
          <p>
            Head Office: 1 The Manor Grove Centre, Vicarage Farm Road,
            Boongate, Peterborough, PE1 5UH, United Kingdom.
          </p>
        </div>
        <div>
          <h3>Quick Links</h3>
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
        <div>
          <h3>Safety</h3>
          <span>18+ only</span>
          <span>Nicotine is addictive</span>
          <span>Keep e-liquids away from children</span>
          <span>Non-smokers should not buy nicotine products</span>
        </div>
      </footer>
    </main>
  );
}
