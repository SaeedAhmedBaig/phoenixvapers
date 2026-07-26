import { Document, Page, Text, View } from "@react-pdf/renderer";
import { formatPence } from "@phoenix/utils/money";

import { DocFooter, DocHeader, styles } from "./branding";

const STATUS_LABEL = {
  created: "Processing",
  payment_authorised: "Payment authorised",
  payment_failed: "Payment failed",
  compliance_confirmed: "Confirmed",
  accepted: "Accepted",
  cancelled: "Cancelled",
};

/** Branded sales & duty report over a date range (spec §28). */
export function SalesReportDocument({ report }) {
  const r = report.realised ?? { orders: 0, netMinor: 0, dutyMinor: 0, vatMinor: 0, totalMinor: 0 };
  const counts = report.statusCounts ?? {};
  const range = report.range ?? {};
  const rangeLabel = range.from || range.to ? `${range.from ?? "start"} → ${range.to ?? "today"}` : "All time";

  return (
    <Document title="Sales & duty report" author="Phoenix Vapers">
      <Page size="A4" style={styles.page}>
        <DocHeader title="SALES & DUTY REPORT" meta={[`Period: ${rangeLabel}`, `Generated ${new Date().toISOString().slice(0, 10)}`]} />

        <Text style={styles.h2}>Realised revenue (accepted orders)</Text>
        <View style={styles.kpiRow}>
          <View style={styles.kpi}><Text style={styles.kpiLabel}>Accepted orders</Text><Text style={styles.kpiValue}>{r.orders}</Text></View>
          <View style={styles.kpi}><Text style={styles.kpiLabel}>Net revenue</Text><Text style={styles.kpiValue}>{formatPence(r.netMinor)}</Text></View>
          <View style={styles.kpi}><Text style={styles.kpiLabel}>Vaping duty</Text><Text style={styles.kpiValue}>{formatPence(r.dutyMinor)}</Text></View>
          <View style={styles.kpi}><Text style={styles.kpiLabel}>VAT</Text><Text style={styles.kpiValue}>{formatPence(r.vatMinor)}</Text></View>
        </View>

        <View style={styles.totals}>
          <View style={styles.grand}><Text>Gross taken</Text><Text>{formatPence(r.totalMinor)}</Text></View>
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={styles.h2}>Order funnel</Text>
          <View style={styles.tHead}>
            <Text style={[styles.th, { flex: 4 }]}>Status</Text>
            <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>Orders</Text>
          </View>
          {Object.keys(STATUS_LABEL).map((s) => (
            <View key={s} style={styles.tRow}>
              <Text style={[styles.td, { flex: 4 }]}>{STATUS_LABEL[s]}</Text>
              <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>{counts[s] ?? 0}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.muted, { marginTop: 22 }]}>
          Figures are duty-inclusive. "Realised" counts only accepted orders (payment captured). Duty and VAT are itemised for reporting to HMRC.
        </Text>

        <DocFooter />
      </Page>
    </Document>
  );
}
