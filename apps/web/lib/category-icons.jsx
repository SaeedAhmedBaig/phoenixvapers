import {
  Beaker,
  Cpu,
  Droplets,
  FlaskConical,
  Leaf,
  Package,
  Settings2,
} from "lucide-react";

/** Line icons per catalogue category — geometric, brand-calm (spec §21 iconography). */
export const CATEGORY_ICONS = {
  "e-liquids": Droplets,
  "nic-salts": FlaskConical,
  shortfills: Beaker,
  "hardware-kits": Cpu,
  "coils-consumables": Settings2,
  accessories: Package,
  cbd: Leaf,
};

export function CategoryIcon({ slug, className = "size-6", ...props }) {
  const Icon = CATEGORY_ICONS[slug] ?? Package;
  return <Icon className={className} strokeWidth={1.5} aria-hidden {...props} />;
}
