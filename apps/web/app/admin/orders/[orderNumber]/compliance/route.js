import { renderToBuffer } from "@react-pdf/renderer";

import { CompliancePackDocument } from "@/components/pdf/compliance-pack-document";
import { operatorApi } from "@/lib/admin";
import { AuthRequiredError } from "@/lib/auth";

/** Per-order compliance evidence pack PDF (age verification + audit trail). */
export async function GET(_request, { params }) {
  const { orderNumber } = await params;
  try {
    const order = await operatorApi(`/admin/orders/${orderNumber}`);
    const pdf = await renderToBuffer(<CompliancePackDocument order={order} />);
    return new Response(pdf, {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="compliance-${orderNumber}.pdf"`,
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof AuthRequiredError) return new Response("Sign in required.", { status: 401 });
    return new Response(`Could not generate pack: ${error.message}`, { status: 500 });
  }
}
