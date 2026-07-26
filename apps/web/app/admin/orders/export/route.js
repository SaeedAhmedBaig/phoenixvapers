import { operatorApi } from "@/lib/admin";
import { AuthRequiredError } from "@/lib/auth";
import { toCsv } from "@/lib/csv";

/**
 * Orders CSV export (finance / support / admin — the API gates by role).
 * Honours the same status/search filters as the console list so a filtered
 * view exports exactly what's on screen.
 */
const COLUMNS = [
  { key: "orderNumber", header: "orderNumber" },
  { key: "placedAt", header: "placedAt" },
  { key: "email", header: "email" },
  { key: "status", header: "status" },
  { key: "itemCount", header: "items" },
  { key: "netMinor", header: "netMinor" },
  { key: "dutyMinor", header: "dutyMinor" },
  { key: "vatMinor", header: "vatMinor" },
  { key: "totalMinor", header: "totalMinor" },
];

export async function GET(request) {
  const url = new URL(request.url);
  const filter = new URLSearchParams();
  for (const key of ["status", "q"]) {
    const v = url.searchParams.get(key);
    if (v) filter.set(key, v);
  }

  try {
    const items = await fetchAll("/admin/orders", filter);
    const rows = items.map((o) => ({
      orderNumber: o.orderNumber,
      placedAt: o.placedAt ? new Date(o.placedAt).toISOString() : "",
      email: o.email ?? "",
      status: o.status,
      itemCount: o.itemCount,
      netMinor: o.totals?.netMinor ?? "",
      dutyMinor: o.totals?.dutyMinor ?? "",
      vatMinor: o.totals?.vatMinor ?? "",
      totalMinor: o.totals?.totalMinor ?? "",
    }));
    const stamp = new Date().toISOString().slice(0, 10);
    return new Response(toCsv(rows, COLUMNS), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="orders-${stamp}.csv"`,
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof AuthRequiredError) return new Response("Sign in required.", { status: 401 });
    return new Response(`Export failed: ${error.message}`, { status: 403 });
  }
}

/** Page through an operator list endpoint (API caps pageSize at 100). */
async function fetchAll(path, filter) {
  const base = filter.toString();
  const q = (page) => `${path}?${base ? `${base}&` : ""}pageSize=100&page=${page}`;
  const first = await operatorApi(q(1));
  const items = [...(first.items ?? [])];
  const total = first.total ?? items.length;
  for (let page = 2; items.length < total && page <= 200; page += 1) {
    const next = await operatorApi(q(page));
    if (!next.items?.length) break;
    items.push(...next.items);
  }
  return items;
}
