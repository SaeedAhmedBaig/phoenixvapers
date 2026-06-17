import Link from "next/link";
import { notFound } from "next/navigation";
import { footerLinks, pageSlugs, pages, siteNav, supportLinks } from "../siteData";

export function generateStaticParams() {
  return pageSlugs.map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const page = pages[params.slug];

  if (!page) {
    return {};
  }

  return {
    title: `${page.eyebrow} | Phoenix Vapers`,
    description: page.description,
  };
}

function Header() {
  return (
    <>
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
          {siteNav.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link className="headerCta" href="/faq">
          Find My Vape
        </Link>
      </header>
    </>
  );
}

function PageFooter() {
  return (
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
          Head Office: 1 The Manor Grove Centre, Vicarage Farm Road, Boongate,
          Peterborough, PE1 5UH, United Kingdom.
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
    </footer>
  );
}

function StatGrid({ stats }) {
  if (!stats) {
    return null;
  }

  return (
    <div className="specGrid pageStats">
      {stats.map(([value, label]) => (
        <article key={`${value}-${label}`}>
          <strong>{value}</strong>
          <span>{label}</span>
        </article>
      ))}
    </div>
  );
}

function ContentSection({ section }) {
  return (
    <section className="section innerSection">
      <div className="sectionIntro">
        <h2>{section.title}</h2>
      </div>

      {section.cards ? (
        <div className="categoryGrid">
          {section.cards.map((card) => (
            <article className="categoryCard" key={card.title}>
              <p>{card.meta}</p>
              <h3>{card.title}</h3>
              <span>{card.text}</span>
            </article>
          ))}
        </div>
      ) : null}

      {section.list ? (
        <div className="infoList">
          {section.list.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function FaqList({ faqs }) {
  if (!faqs) {
    return null;
  }

  return (
    <section className="section innerSection">
      <div className="sectionIntro">
        <h2>Common Questions</h2>
      </div>
      <div className="faqList">
        {faqs.map((faq) => (
          <details key={faq.question}>
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function ContactForm() {
  return (
    <section className="newsletter contactPanel">
      <div>
        <p className="eyebrow">Support Request</p>
        <h2>Send the team a message.</h2>
        <p>
          This frontend form is ready to connect to an email service or CRM when
          backend handling is added.
        </p>
      </div>
      <form>
        <label htmlFor="name">Name</label>
        <input id="name" type="text" placeholder="Your name" />
        <label htmlFor="email">Email address</label>
        <input id="email" type="email" placeholder="you@example.com" />
        <label htmlFor="message">Message</label>
        <textarea id="message" placeholder="How can Phoenix Vapers help?" rows="5" />
        <button type="submit">Send Message</button>
      </form>
    </section>
  );
}

export default function ContentPage({ params }) {
  const page = pages[params.slug];

  if (!page) {
    notFound();
  }

  return (
    <main>
      <Header />

      <section className="pageHero">
        <div>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p className="heroLead">{page.description}</p>
          {page.cta ? (
            <Link className="primaryButton" href={page.ctaHref}>
              {page.cta}
            </Link>
          ) : null}
        </div>
      </section>

      <StatGrid stats={page.stats} />

      {page.sections?.map((section) => (
        <ContentSection key={section.title} section={section} />
      ))}

      <FaqList faqs={page.faqs} />

      {page.form ? <ContactForm /> : null}

      <PageFooter />
    </main>
  );
}
