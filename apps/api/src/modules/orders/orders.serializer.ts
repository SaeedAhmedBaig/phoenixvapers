/**
 * Customer-facing projections of the order document.
 *
 * Whitelist built UP from named fields (privacy boundary): internal ids,
 * PSP intent ids, verification evidence refs, and actor names in the
 * event history never reach the storefront.
 */

const money = (m: any) => ({
  netMinor: m.netMinor,
  dutyMinor: m.dutyMinor,
  vatMinor: m.vatMinor,
  totalMinor: m.totalMinor,
});

/** Order list row — the account "My orders" table. */
export function toOrderSummary(doc: any) {
  return {
    orderNumber: doc.orderNumber,
    status: doc.status,
    placedAt: doc.createdAt,
    itemCount: (doc.lines ?? []).reduce(
      (sum: number, line: any) => sum + line.quantity,
      0,
    ),
    totals: money(doc.totals),
  };
}

/** Full customer view — confirmation page and order detail. */
export function toOrderDetail(doc: any) {
  return {
    ...toOrderSummary(doc),
    lines: (doc.lines ?? []).map((line: any) => ({
      sku: line.sku,
      name: line.name,
      brand: line.brand,
      attributes: line.attributes ?? {},
      quantity: line.quantity,
      purchaseType: line.purchaseType,
      unit: money(line.unit),
      line: money(line.line),
    })),
    goodsTotals: money(doc.goodsTotals),
    delivery: {
      methodId: doc.delivery.methodId,
      methodLabel: doc.delivery.methodLabel,
      charge: money(doc.delivery.charge),
      address: {
        line1: doc.delivery.address.line1,
        line2: doc.delivery.address.line2,
        city: doc.delivery.address.city,
        postcode: doc.delivery.address.postcode,
        country: doc.delivery.address.country,
      },
    },
    payment: { status: doc.payment?.status },
    /** Status timeline without operator identities. */
    timeline: (doc.events ?? []).map((event: any) => ({
      at: event.at,
      to: event.to,
      note: event.note,
    })),
  };
}

/* ───────────────────── operator (console) projections ───────────────── */

/** Order-management list row (§7.3) — carries the customer email operators
 *  search and triage on. */
export function toAdminOrderSummary(doc: any) {
  return {
    orderNumber: doc.orderNumber,
    status: doc.status,
    placedAt: doc.createdAt,
    email: doc.email,
    itemCount: (doc.lines ?? []).reduce(
      (sum: number, line: any) => sum + line.quantity,
      0,
    ),
    totals: money(doc.totals),
  };
}

/**
 * Full operator view of an order — everything the customer sees PLUS the
 * operational data a console needs: payment intent/status, the age-
 * verification evidence this sale relied on (§4.6), and the fully-attributed
 * event history (who did what, when). This is an internal surface behind
 * the operator guard, never returned to a shopper.
 */
export function toAdminOrderDetail(doc: any) {
  return {
    ...toOrderDetail(doc),
    email: doc.email,
    payment: {
      provider: doc.payment?.provider,
      status: doc.payment?.status,
      intentId: doc.payment?.intentId,
      authorisedAt: doc.payment?.authorisedAt,
      capturedAt: doc.payment?.capturedAt,
      declineReason: doc.payment?.declineReason,
    },
    verification: doc.verification
      ? {
          evidenceRef: doc.verification.evidenceRef,
          verifiedAt: doc.verification.verifiedAt,
          expiresAt: doc.verification.expiresAt,
        }
      : null,
    /** Attributed timeline — operators may see who acted. */
    timeline: (doc.events ?? []).map((event: any) => ({
      at: event.at,
      from: event.from,
      to: event.to,
      actor: event.actor,
      note: event.note,
    })),
  };
}
