import { renderToBuffer } from "@react-pdf/renderer";

import { CatalogueReportDocument } from "@/components/pdf/catalogue-report-document";
import { operatorApi } from "@/lib/admin";
import { AuthRequiredError } from "@/lib/auth";

/** Branded catalogue / stock report PDF (product & price list). */
export async function GET() {
  try {
    const first = await operatorApi("/admin/products?pageSize=100&page=1");
    const items = [...(first.items ?? [])];
    const total = first.total ?? items.length;
    for (let page = 2; items.length < total && page <= 200; page += 1) {
      const next = await operatorApi(`/admin/products?pageSize=100&page=${page}`);
      if (!next.items?.length) break;
      items.push(...next.items);
    }

    const pdf = await renderToBuffer(<CatalogueReportDocument products={items} counts={first.counts} />);
    return new Response(pdf, {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="catalogue-report.pdf"`,
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof AuthRequiredError) return new Response("Sign in required.", { status: 401 });
    return new Response(`Could not generate report: ${error.message}`, { status: 500 });
  }
}
