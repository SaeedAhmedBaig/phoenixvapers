// Static navigation and UI copy only. Catalogue, CMS pages, stores, and
// promotions all come from the live API (see app/lib/api.js) — nothing
// product- or content-related is hard-coded here.

export const siteNav = [
  { label: "Shop", href: "/shop" },
  { label: "E-Liquids", href: "/e-liquids" },
  { label: "Hardware", href: "/hardware" },
  { label: "Coils", href: "/coils" },
  { label: "CBD", href: "/cbd" },
  { label: "Deals", href: "/deals" },
  { label: "Find Stores", href: "/store-locator" },
];

export const footerLinks = [
  { label: "About Us", href: "/about" },
  { label: "Delivery", href: "/delivery" },
  { label: "Returns", href: "/returns" },
  { label: "Loyalty Points", href: "/loyalty" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Safety", href: "/safety" },
];

export const supportLinks = [
  "Live chat weekdays 8am-4pm",
  "Phone support: 01733887900",
  "Email: orders@phoenixeliquid.co.uk",
  "Store complaints: petertuck@phoenixeliquid.co.uk",
];

export const merchandisingHighlights = [
  "Free Royal Mail Tracked 24 over £30",
  "100 loyalty points on registration",
  "UK-manufactured e-liquids",
  "EL-Science backed safety standards",
];

export const featuredCollections = [
  { slug: "new-arrivals", title: "New Arrivals", description: "Fresh flavour drops and launch ranges." },
  { slug: "deals", title: "Bundle Deals", description: "Multipacks, delivery savings, and loyalty value." },
  { slug: "starter-kits", title: "Starter Kits", description: "Beginner-friendly devices paired with the right nic salts." },
  { slug: "best-sellers", title: "Best Sellers", description: "High-repeat e-liquids and hardware ranges." },
];
