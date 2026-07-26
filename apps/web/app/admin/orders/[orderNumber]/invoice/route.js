import { renderToBuffer } from "@react-pdf/renderer";

import { InvoiceDocument } from "@/components/pdf/invoice-document";
import { operatorApi } from "@/lib/admin";
import { AuthRequiredError } from "@/lib/auth";

/** Branded VAT invoice PDF for one order (operator session; API-gated). */
export async function GET(_request, { params }) {
  const { orderNumber } = await params;
  try {
    const order = await operatorApi(`/admin/orders/${orderNumber}`);
    const pdf = await renderToBuffer(<InvoiceDocument order={order} />);
    return new Response(pdf, {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="invoice-${orderNumber}.pdf"`,
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof AuthRequiredError) return new Response("Sign in required.", { status: 401 });
    return new Response(`Could not generate invoice: ${error.message}`, { status: 500 });
  }
}
