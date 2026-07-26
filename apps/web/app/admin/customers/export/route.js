import { operatorApi } from "@/lib/admin";
import { AuthRequiredError } from "@/lib/auth";
import { toCsv } from "@/lib/csv";

/**
 * Customers CSV export (compliance / support / admin — API-gated). Exposes
 * account + verification STATE only (never credentials or identity data);
 * the evidence reference is an opaque provider handle, safe to export.
 */
const COLUMNS = [
  { key: "name", header: "name" },
  { key: "email", header: "email" },
  { key: "joined", header: "joined" },
  { key: "avStatus", header: "verificationStatus" },
  { key: "avMethod", header: "verificationMethod" },
  { key: "avExpires", header: "verificationExpires" },
  { key: "evidenceRef", header: "evidenceRef" },
];

export async function GET(request) {
  const url = new URL(request.url);
  const filter = new URLSearchParams();
  const status = url.searchParams.get("status");
  if (status) filter.set("status", status);

  try {
    const items = await fetchAll("/admin/verification/customers", filter);
    const rows = items.map((c) => ({
      name: c.name,
      email: c.email,
      joined: c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : "",
      avStatus: c.verification?.status ?? "",
      avMethod: c.verification?.method ?? "",
      avExpires: c.verification?.expiresAt ? new Date(c.verification.expiresAt).toISOString().slice(0, 10) : "",
      evidenceRef: c.verification?.evidenceRef ?? "",
    }));
    const stamp = new Date().toISOString().slice(0, 10);
    return new Response(toCsv(rows, COLUMNS), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="customers-${stamp}.csv"`,
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof AuthRequiredError) return new Response("Sign in required.", { status: 401 });
    return new Response(`Export failed: ${error.message}`, { status: 403 });
  }
}

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
