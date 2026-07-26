import { Document, Page, Text, View } from "@react-pdf/renderer";
import { formatPence } from "@phoenix/utils/money";

import { BRAND, DocFooter, DocHeader, styles } from "./branding";

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

/** Branded VAT invoice / receipt for one order (spec §6.5, §29.6). */
export function InvoiceDocument({ order }) {
  const addr = order.delivery.address;
  const paid = order.payment?.status === "captured";

  return (
    <Document title={`Invoice ${order.orderNumber}`} author="Phoenix Vapers">
      <Page size="A4" style={styles.page}>
        <DocHeader
          title={paid ? "INVOICE" : "ORDER"}
          meta={[order.orderNumber, dateFmt.format(new Date(order.placedAt))]}
        />

        <View style={[styles.twoCol, styles.section]}>
          <View style={styles.col}>
            <Text style={styles.h2}>Billed to</Text>
            <Text>{order.email ?? "—"}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.h2}>Deliver to</Text>
            <Text>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</Text>
            <Text>{addr.city}, {addr.postcode}</Text>
            <Text>{addr.country}</Text>
          </View>
        </View>

        {/* Line items */}
        <View style={styles.tHead}>
          <Text style={[styles.th, { flex: 4 }]}>Item</Text>
          <Text style={[styles.th, { flex: 2 }]}>SKU</Text>
          <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>Qty</Text>
          <Text style={[styles.th, { flex: 2, textAlign: "right" }]}>Unit</Text>
          <Text style={[styles.th, { flex: 2, textAlign: "right" }]}>Amount</Text>
        </View>
        {order.lines.map((line, i) => (
          <View key={i} style={styles.tRow}>
            <Text style={[styles.td, { flex: 4 }]}>{line.name}</Text>
            <Text style={[styles.td, { flex: 2, color: BRAND.muted }]}>{line.sku}</Text>
            <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>{line.quantity}</Text>
            <Text style={[styles.td, { flex: 2, textAlign: "right" }]}>{formatPence(line.unit.totalMinor)}</Text>
            <Text style={[styles.td, { flex: 2, textAlign: "right" }]}>{formatPence(line.line.totalMinor)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}><Text style={styles.muted}>Products (net)</Text><Text>{formatPence(order.goodsTotals.netMinor)}</Text></View>
          <View style={styles.totalRow}><Text style={styles.muted}>Vaping Products Duty</Text><Text>{formatPence(order.goodsTotals.dutyMinor)}</Text></View>
          <View style={styles.totalRow}><Text style={styles.muted}>VAT</Text><Text>{formatPence(order.goodsTotals.vatMinor)}</Text></View>
          <View style={styles.totalRow}><Text style={styles.muted}>Delivery ({order.delivery.methodLabel})</Text><Text>{order.delivery.charge.totalMinor === 0 ? "Free" : formatPence(order.delivery.charge.totalMinor)}</Text></View>
          <View style={styles.grand}><Text>{paid ? "Total paid" : "Total"}</Text><Text>{formatPence(order.totals.totalMinor)}</Text></View>
        </View>

        <View style={{ marginTop: 26 }}>
          <Text style={styles.muted}>
            All prices include UK Vaping Products Duty and VAT at the prevailing rates. Payment status: {order.payment?.status ?? "—"}.
          </Text>
        </View>

        <DocFooter />
      </Page>
    </Document>
  );
}
