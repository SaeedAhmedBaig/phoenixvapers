import { StyleSheet, Text, View } from "@react-pdf/renderer";

/**
 * Branded PDF toolkit (spec §29.6 — the branded document system). Shared
 * palette, header, and footer so every generated document — invoice, report,
 * compliance pack — reads as one Phoenix system. Uses the built-in Helvetica
 * family (no font files to ship), with Phoenix Green and Ink Green accents.
 */
export const BRAND = {
  green: "#08ab5e",
  ink: "#0b2e20",
  text: "#111827",
  muted: "#6b7280",
  line: "#e5e7eb",
  light: "#f6f8f7",
};

export const styles = StyleSheet.create({
  page: {
    paddingTop: 40, paddingBottom: 60, paddingHorizontal: 44,
    fontSize: 10, color: BRAND.text, fontFamily: "Helvetica", lineHeight: 1.4,
  },
  headerBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    borderBottomWidth: 2, borderBottomColor: BRAND.green, paddingBottom: 12, marginBottom: 22,
  },
  brand: { fontSize: 17, fontFamily: "Helvetica-Bold", color: BRAND.ink },
  brandSub: { fontSize: 8, color: BRAND.muted, marginTop: 3, textTransform: "uppercase", letterSpacing: 1 },
  docTitle: { fontSize: 15, fontFamily: "Helvetica-Bold", textAlign: "right", color: BRAND.ink },
  docMeta: { fontSize: 9, color: BRAND.muted, textAlign: "right", marginTop: 3 },

  h2: { fontSize: 11, fontFamily: "Helvetica-Bold", color: BRAND.ink, marginBottom: 6 },
  section: { marginBottom: 18 },
  twoCol: { flexDirection: "row", justifyContent: "space-between", gap: 24 },
  col: { flex: 1 },
  muted: { color: BRAND.muted },

  // Table
  tHead: { flexDirection: "row", backgroundColor: BRAND.ink, color: "#ffffff", paddingVertical: 5, paddingHorizontal: 6 },
  tRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BRAND.line, paddingVertical: 5, paddingHorizontal: 6 },
  th: { fontSize: 8.5, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 0.4 },
  td: { fontSize: 9 },
  right: { textAlign: "right" },

  // Totals block
  totals: { marginTop: 10, marginLeft: "auto", width: 240 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  grand: {
    flexDirection: "row", justifyContent: "space-between",
    borderTopWidth: 1.5, borderTopColor: BRAND.ink, marginTop: 4, paddingTop: 5,
    fontSize: 12, fontFamily: "Helvetica-Bold",
  },

  // KPI cards
  kpiRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  kpi: { flex: 1, borderWidth: 1, borderColor: BRAND.line, backgroundColor: BRAND.light, padding: 10 },
  kpiLabel: { fontSize: 7.5, color: BRAND.muted, textTransform: "uppercase", letterSpacing: 0.6 },
  kpiValue: { fontSize: 15, fontFamily: "Helvetica-Bold", color: BRAND.ink, marginTop: 4 },

  pill: { alignSelf: "flex-start", fontSize: 8, color: "#ffffff", backgroundColor: BRAND.green, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 2 },
  footer: {
    position: "absolute", bottom: 26, left: 44, right: 44,
    borderTopWidth: 1, borderTopColor: BRAND.line, paddingTop: 8,
    flexDirection: "row", justifyContent: "space-between",
  },
  footerText: { fontSize: 7.5, color: BRAND.muted },
});

/** Branded document header — wordmark + document title/meta. */
export function DocHeader({ title, meta }) {
  return (
    <View style={styles.headerBar}>
      <View>
        <Text style={styles.brand}>Phoenix Vapers</Text>
        <Text style={styles.brandSub}>UK-made · Batch-tested · Duty-inclusive</Text>
      </View>
      <View>
        <Text style={styles.docTitle}>{title}</Text>
        {(meta ?? []).map((m, i) => <Text key={i} style={styles.docMeta}>{m}</Text>)}
      </View>
    </View>
  );
}

/** Fixed footer with company line + page numbers, on every page. */
export function DocFooter() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        Phoenix Vapers Limited · Peterborough, United Kingdom · VAT &amp; Vaping Products Duty registered
      </Text>
      <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );
}
