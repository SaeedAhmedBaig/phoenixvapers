import Link from "next/link";

import { SectionEyebrow } from "@/components/home/section-eyebrow";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Wholesale" };

export default function WholesalePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <SectionEyebrow>Trade</SectionEyebrow>
      <h1 className="font-display mt-2 text-3xl font-medium sm:text-4xl">Wholesale & B2B</h1>
      <p className="text-muted-foreground mt-4 text-base leading-relaxed">
        Stock your shop with a supplier you can prove. Trade accounts receive verified pricing, bulk ordering, credit terms, and compliance documentation on every invoice.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {[
          "Verified trade pricing",
          "Bulk order — SKU list, CSV, or reorder",
          "Credit terms for established accounts",
          "Duty and MHRA documentation attached",
        ].map((item) => (
          <div key={item} className="phx-card p-5 text-sm font-medium">{item}</div>
        ))}
      </div>

      <p className="text-muted-foreground mt-8 text-sm">
        Our trade portal is opening soon. Register your interest and our wholesale team will be in touch as trade accounts become available.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button className="rounded-none" disabled>Apply for trade account</Button>
        <Button asChild variant="outline" className="rounded-none"><Link href="/login">Trade login</Link></Button>
      </div>
    </div>
  );
}
