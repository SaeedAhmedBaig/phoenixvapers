import { AdminShell } from "@/components/admin/admin-shell";
import { requireOperator } from "@/lib/admin";

export const metadata = {
  title: { default: "Console", template: "%s · Phoenix Console" },
  robots: { index: false, follow: false },
};

/** Which console sections each role may use (mirrors the API role policy). */
const ALL = ["merchandiser", "compliance_officer", "customer_support", "finance", "fulfilment", "marketing", "platform_admin"];

/**
 * Grouped navigation — Notion-style sections. Each item declares the roles
 * that may see it; the layout filters items and drops empty sections, so an
 * operator only ever sees the areas their role permits (§25.1). The API
 * remains the enforcement authority.
 */
const NAV_GROUPS = [
  {
    section: "Overview",
    items: [{ href: "/admin", label: "Dashboard", roles: ALL }],
  },
  {
    section: "Commerce",
    items: [
      { href: "/admin/orders", label: "Orders", roles: ["platform_admin", "customer_support", "finance"] },
      { href: "/admin/products", label: "Catalogue", roles: ["merchandiser", "compliance_officer", "platform_admin"] },
      { href: "/admin/fulfilment", label: "Fulfilment", roles: ["fulfilment", "platform_admin"] },
    ],
  },
  {
    section: "Customers",
    items: [
      { href: "/admin/customers", label: "Verification", roles: ["compliance_officer", "platform_admin", "customer_support"] },
      { href: "/admin/marketing", label: "Marketing", roles: ["marketing", "platform_admin"] },
    ],
  },
  {
    section: "Insight",
    items: [{ href: "/admin/reports", label: "Reports", roles: ["finance", "platform_admin"] }],
  },
  {
    section: "Administration",
    items: [
      { href: "/admin/staff", label: "Staff", roles: ["platform_admin"] },
      { href: "/admin/roles", label: "Roles & permissions", roles: ["platform_admin", "compliance_officer"] },
    ],
  },
];

export default async function AdminLayout({ children }) {
  // Fail-closed gate: resolves the operator or redirects out (§16.3).
  const operator = await requireOperator();

  // Filter items by role, then drop any section left with no visible items.
  const nav = NAV_GROUPS.map((group) => ({
    section: group.section,
    items: group.items.filter((item) => item.roles.includes(operator.role)),
  })).filter((group) => group.items.length > 0);

  return (
    <AdminShell operator={operator} nav={nav}>
      {children}
    </AdminShell>
  );
}
