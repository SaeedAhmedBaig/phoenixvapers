import { AuthRequiredError } from "@/lib/auth";
import { operatorApi } from "@/lib/admin";
import { toCsv } from "@/lib/csv";
import { PRODUCT_CSV_COLUMNS, flattenProduct } from "@/lib/product-csv";

/**
 * Bulk catalogue export → CSV download (operator session; the API enforces
 * that only catalogue roles can read /admin/products). `?template=1` returns
 * just the header + one example row for the import flow.
 */
export async function GET(request) {
  const url = new URL(request.url);

  if (url.searchParams.get("template") === "1") {
    const example = {
      name: "Example E-Liquid 10ml", brand: "Phoenix", range: "", category: "e-liquids",
      status: "", sku: "PHX-EXAMPLE-01", netPriceMinor: "399", inStockStub: "true",
      strengthMgPerMl: "10", volumeMl: "10", vgPg: "50/50", madeIn: "United Kingdom",
      batchTested: "true", mediaUrl: "/img/example.png", mediaAlt: "Example bottle",
      description: "Replace this row with your products. Twenty characters minimum.",
    };
    return csvResponse(toCsv([example], PRODUCT_CSV_COLUMNS), "product-import-template.csv");
  }

  try {
    // Page through the whole catalogue (API caps pageSize at 100).
    const first = await operatorApi("/admin/products?pageSize=100&page=1");
    const items = [...(first.items ?? [])];
    const total = first.total ?? items.length;
    for (let page = 2; items.length < total && page <= 200; page += 1) {
      const next = await operatorApi(`/admin/products?pageSize=100&page=${page}`);
      if (!next.items?.length) break;
      items.push(...next.items);
    }

    const csv = toCsv(items.map(flattenProduct), PRODUCT_CSV_COLUMNS);
    const stamp = new Date().toISOString().slice(0, 10);
    return csvResponse(csv, `products-${stamp}.csv`);
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return new Response("Sign in as a catalogue operator to export.", { status: 401 });
    }
    return new Response(`Export failed: ${error.message}`, { status: 403 });
  }
}

function csvResponse(body, filename) {
  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
