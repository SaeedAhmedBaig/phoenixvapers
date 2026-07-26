import { Document, Page, Text, View } from "@react-pdf/renderer";

import { BRAND, DocFooter, DocHeader, styles } from "./branding";

const dtFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
});
const dFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

/**
 * Compliance evidence pack for one order (spec §4.6, §29.6) — the artifact
 * that answers "prove this regulated sale went to a verified adult and a
 * compliant product set" years later. Outcome + evidence references only,
 * never identity documents (data minimisation, §16.5).
 */
export function CompliancePackDocument({ order }) {
  const av = order.verification;

  return (
    <Document title={`Compliance evidence ${order.orderNumber}`} author="Phoenix Vapers">
      <Page size="A4" style={styles.page}>
        <DocHeader title="COMPLIANCE EVIDENCE PACK" meta={[order.orderNumber, `Placed ${dFmt.format(new Date(order.placedAt))}`]} />

        <View style={styles.section}>
          <Text style={styles.h2}>Age verification</Text>
          {av ? (
            <View>
              <Row label="Outcome" value="Passed — verified adult (18+)" />
              <Row label="Evidence reference" value={av.evidenceRef ?? "—"} />
              <Row label="Verified at" value={av.verifiedAt ? dtFmt.format(new Date(av.verifiedAt)) : "—"} />
              <Row label="Valid until" value={av.expiresAt ? dFmt.format(new Date(av.expiresAt)) : "—"} />
            </View>
          ) : (
            <Text style={styles.muted}>No verification snapshot on this order.</Text>
          )}
          <Text style={[styles.muted, { marginTop: 6, fontSize: 8.5 }]}>
            Verification was asserted server-side before payment and re-asserted before the order was Compliance Confirmed. Identity documents are never stored — only the outcome and this evidence reference.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Products supplied</Text>
          <View style={styles.tHead}>
            <Text style={[styles.th, { flex: 4 }]}>Product</Text>
            <Text style={[styles.th, { flex: 2 }]}>SKU</Text>
            <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>Qty</Text>
          </View>
          {order.lines.map((line, i) => (
            <View key={i} style={styles.tRow}>
              <Text style={[styles.td, { flex: 4 }]}>{line.name}</Text>
              <Text style={[styles.td, { flex: 2, color: BRAND.muted }]}>{line.sku}</Text>
              <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>{line.quantity}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Order audit trail</Text>
          {(order.timeline ?? []).map((e, i) => (
            <View key={i} style={{ marginBottom: 3 }}>
              <Text style={{ fontSize: 9 }}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>{e.to}</Text>
                <Text style={styles.muted}>  ·  {dtFmt.format(new Date(e.at))}  ·  {e.actor}{e.note ? `  ·  ${e.note}` : ""}</Text>
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.muted, { marginTop: 10, fontSize: 8.5 }]}>
          This pack is generated from the immutable order snapshot and event history. Phoenix Vapers Limited retains age-verification evidence in line with its data-retention policy.
        </Text>

        <DocFooter />
      </Page>
    </Document>
  );
}

function Row({ label, value }) {
  return (
    <View style={{ flexDirection: "row", paddingVertical: 1.5 }}>
      <Text style={{ width: 130, color: BRAND.muted }}>{label}</Text>
      <Text style={{ flex: 1 }}>{value}</Text>
    </View>
  );
}
