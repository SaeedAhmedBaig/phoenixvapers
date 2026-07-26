import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/catalog/product-card";
import { ProductDetailContent, ProductDetailSummary } from "@/components/catalog/product-detail-panel";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { SectionEyebrow } from "@/components/home/section-eyebrow";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { apiGet } from "@/lib/api";
import { categoryLabel } from "@/lib/categories";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const raw = await apiGet(`/products/${slug}`);
  const product = raw?.product ?? raw;
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const raw = await apiGet(`/products/${slug}`);
  if (!raw) notFound();

  const product = raw.product ?? raw;
  const related = raw.related ?? [];

  return (
    <div>
      {/* PDP header strip */}
      <div className="border-border border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/c/${product.category}`}>{categoryLabel(product.category)}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage className="max-w-[200px] truncate sm:max-w-none">{product.name}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16 xl:gap-20">
          <ProductGallery product={product} />
          <ProductDetailSummary product={product} />
        </div>

        <ProductDetailContent product={product} />

        {related.length ? (
          <section className="border-border mt-16 border-t pt-14 lg:mt-20">
            <SectionEyebrow>Related</SectionEyebrow>
            <h2 className="font-display mt-1 text-2xl font-medium">You may also like</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => <ProductCard key={p.slug} product={p} />)}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
