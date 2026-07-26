import { Document, Page, Text, View } from "@react-pdf/renderer";
import { formatPence } from "@phoenix/utils/money";

import { BRAND, DocFooter, DocHeader, styles } from "./branding";

/** Branded catalogue / stock report — a product & price list (spec §28). */
export function CatalogueReportDocument({ products, counts }) {
  const flat = products.map((p) => {
    const v = (p.variants ?? []).find((x) => x.netPriceMinor != null) ?? p.variants?.[0] ?? {};
    return {
      name: p.name, brand: p.brand, category: p.category, status: p.status,
      sku: v.sku ?? "—", net: v.netPriceMinor, inStock: v.inStockStub !== false,
    };
  });

  return (
    <Document title="Catalogue report" author="Phoenix Vapers">
      <Page size="A4" style={styles.page}>
        <DocHeader title="CATALOGUE REPORT" meta={[`${products.length} products`, `Generated ${new Date().toISOString().slice(0, 10)}`]} />

        <View style={styles.kpiRow}>
          <View style={styles.kpi}><Text style={styles.kpiLabel}>Sellable</Text><Text style={styles.kpiValue}>{counts?.sellable ?? 0}</Text></View>
          <View style={styles.kpi}><Text style={styles.kpiLabel}>In review</Text><Text style={styles.kpiValue}>{counts?.review ?? 0}</Text></View>
          <View style={styles.kpi}><Text style={styles.kpiLabel}>Draft</Text><Text style={styles.kpiValue}>{counts?.draft ?? 0}</Text></View>
          <View style={styles.kpi}><Text style={styles.kpiLabel}>Retired</Text><Text style={styles.kpiValue}>{counts?.retired ?? 0}</Text></View>
        </View>

        <View style={styles.tHead} fixed>
          <Text style={[styles.th, { flex: 4 }]}>Product</Text>
          <Text style={[styles.th, { flex: 2 }]}>SKU</Text>
          <Text style={[styles.th, { flex: 2 }]}>Category</Text>
          <Text style={[styles.th, { flex: 2 }]}>Status</Text>
          <Text style={[styles.th, { flex: 2, textAlign: "right" }]}>Net price</Text>
        </View>
        {flat.map((p, i) => (
          <View key={i} style={styles.tRow} wrap={false}>
            <Text style={[styles.td, { flex: 4 }]}>{p.name}</Text>
            <Text style={[styles.td, { flex: 2, color: BRAND.muted }]}>{p.sku}</Text>
            <Text style={[styles.td, { flex: 2 }]}>{p.category}</Text>
            <Text style={[styles.td, { flex: 2 }]}>{p.status}{p.inStock ? "" : " · out of stock"}</Text>
            <Text style={[styles.td, { flex: 2, textAlign: "right" }]}>{p.net != null ? formatPence(p.net) : "—"}</Text>
          </View>
        ))}

        <Text style={[styles.muted, { marginTop: 20 }]}>Net prices exclude duty and VAT (the storefront shows the duty-inclusive price).</Text>

        <DocFooter />
      </Page>
    </Document>
  );
}
