import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid, SectionHeader, StatsGrid, StoreShell } from "../../components";
import { products } from "../../siteData";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);

  if (!product) {
    return {};
  }

  return {
    title: `${product.name} | Phoenix Vapers`,
    description: product.description,
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = products
    .filter((item) => item.category === product.category && item.slug !== product.slug)
    .slice(0, 4);

  return (
    <StoreShell>
      <section className="productDetail">
        <div className="productDetailVisual">
          <span>{product.brand.slice(0, 2).toUpperCase()}</span>
          <small>{product.badge}</small>
        </div>

        <div className="productDetailCopy">
          <p className="eyebrow">{product.brand}</p>
          <h1>{product.name}</h1>
          <p className="heroLead">{product.description}</p>

          <div className="tagRow">
            {product.notes.map((note) => (
              <span key={note}>{note}</span>
            ))}
          </div>

          <StatsGrid
            stats={[
              [product.format, "format"],
              [product.strength, "strength"],
              [`${product.rating} ★`, `${product.reviews} reviews`],
              ["18+", "age restricted"],
            ]}
          />

          <div className="buyBox">
            <div>
              <strong>£{product.price.toFixed(2)}</strong>
              {product.compareAt ? <small>Was £{product.compareAt.toFixed(2)}</small> : null}
            </div>
            <Link className="primaryButton" href="/cart">
              Add To Cart
            </Link>
            <Link className="secondaryButton" href={`/${product.category}`}>
              Back To Category
            </Link>
          </div>
        </div>
      </section>

      <section className="storeSection">
        <SectionHeader
          eyebrow="Product Details"
          title="Built like a real product page."
          text="The PDP includes product format, strength, pricing, badges, tags, trust cues, related products, and buy actions."
        />
        <div className="productInfoGrid">
          <article>
            <h3>Delivery</h3>
            <p>Royal Mail Tracked 24 is free over £30 after discounts and points.</p>
          </article>
          <article>
            <h3>Rewards</h3>
            <p>Earn 1 point for every £1 spent and redeem 100 points for £1 off.</p>
          </article>
          <article>
            <h3>Safety</h3>
            <p>Nicotine products are for adults aged 18+ only and must be kept away from children.</p>
          </article>
        </div>
      </section>

      {relatedProducts.length ? (
        <section className="storeSection">
          <SectionHeader
            eyebrow="Related"
            title="Customers also shop these."
            text="Related product rails are reusable and category-aware."
          />
          <ProductGrid products={relatedProducts} />
        </section>
      ) : null}
    </StoreShell>
  );
}
