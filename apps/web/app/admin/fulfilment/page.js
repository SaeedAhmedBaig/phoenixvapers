import { ConsolePlaceholder } from "@/components/admin/console-placeholder";

export const metadata = { title: "Fulfilment" };

export default function FulfilmentPage() {
  return (
    <ConsolePlaceholder
      eyebrow="Warehouse"
      title="Fulfilment"
      intro="Picking, packing, dispatch, and inventory for the warehouse team — serial-scanned and age-verification-aware, per the compliance spec."
      phase="Phase 4 (Orders & Inventory)"
      features={[
        "Pick lists optimised by warehouse path",
        "Scan-confirmed pick & pack, unit serials bound to the order",
        "Dispatch confirmation updating stock and order state",
        "Inventory by location, zone and bin",
        "Batch, lot and expiry with FEFO picking",
        "Goods-in and put-away",
      ]}
    />
  );
}
