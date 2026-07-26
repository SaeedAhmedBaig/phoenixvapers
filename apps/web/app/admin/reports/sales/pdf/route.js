import { renderToBuffer } from "@react-pdf/renderer";

import { SalesReportDocument } from "@/components/pdf/sales-report-document";
import { operatorApi } from "@/lib/admin";
import { AuthRequiredError } from "@/lib/auth";

/** Branded sales & duty report PDF for the current date range. */
export async function GET(request) {
  const url = new URL(request.url);
  const params = new URLSearchParams();
  for (const key of ["from", "to"]) {
    const v = url.searchParams.get(key);
    if (v) params.set(key, v);
  }
  const qs = params.toString();

  try {
    const report = await operatorApi(`/admin/reports/sales${qs ? `?${qs}` : ""}`);
    const pdf = await renderToBuffer(<SalesReportDocument report={report} />);
    return new Response(pdf, {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="sales-report.pdf"`,
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof AuthRequiredError) return new Response("Sign in required.", { status: 401 });
    return new Response(`Could not generate report: ${error.message}`, { status: 500 });
  }
}
