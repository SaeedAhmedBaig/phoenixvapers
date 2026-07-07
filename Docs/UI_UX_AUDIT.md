# Phoenix Vapers — Full UI/UX Audit

**Date:** 8 July 2026 · **Scope:** every component under `app/` (storefront, account, admin, UI primitives) plus the backend API surface they should be using.
**Method:** file-by-file review of all ~60 JSX components, cross-referenced against the 22 NestJS backend modules and their 60+ live endpoints.

Severity scale:
- **P0 — Broken/deceptive**: feature looks functional but does nothing, shows fake data, or misleads the customer.
- **P1 — Dead ends**: wired-looking controls with no action, missing states, or links to nowhere.
- **P2 — UX/accessibility debt**: works, but with friction, a11y gaps, or missed conventions.
- **P3 — Polish/opportunity**: enhancement that lifts the experience toward enterprise grade.

---

## 1. Systemic findings (the abstractions)

Individual bugs below repeat five root patterns. Fixing the pattern fixes the class.

### A. "Prop-drilled fake" — UI built before the API, never reconnected
Several screens were scaffolded with mock arrays or `setTimeout` fakes and still ship that way: admin Customers, admin Staff, admin Permissions, admin Reports, Merchant dashboard/performance, storefront Contact form, Newsletter signup, account Settings, account Wishlist. The real backend exists for most of them (RBAC roles API, audit API, settings API, reviews API). **Rule: every interactive element must round-trip to the API or not render.**

### B. Session state treated as immortal (fixed 7 Jul 2026)
Access tokens expire in 15 min; providers now auto-refresh. Any new data-loading component must take `accessToken` from context and refetch silently when it rotates.

### C. Claims the platform can't keep
Copy asserts things the system doesn't do: "A confirmation email has been sent" (no mailer wired), "Live chat weekdays 8am–4pm" (no chat), fake card fields at checkout ("PCI-scoped hosted fields" — they're plain inputs writing card numbers into React state), "Google Maps integration ready". **Rule: copy must describe actual behaviour; aspirational features live behind flags, not in customer-facing text.**

### D. Single-image thinking in a gallery world
`Product.galleryUrls` exists end-to-end in the backend, but the admin form uploads exactly one photo and the PDP renders exactly one visual. Cart lines, checkout summary and search results pass `{ categorySlug }` into `ProductVisual`, so they *always* show the icon placeholder even when the product has a photo. **Rule: any surface that renders a product must receive the product's `imageUrl`.**

### E. Filter/search state lives in component memory, not the URL
Product browser facets, sort, admin orders filters — none are reflected in the URL. No shareable links, no back-button restore, no analytics on filter usage. **Rule: list-view state belongs in `searchParams`.**

---

## 2. Storefront — component by component

### 2.1 Global shell (`store-shell.jsx`)
| Sev | Finding |
|---|---|
| P2 | `<main>` wraps header, footer, cart sheet and age gate. Semantically `<main>` should contain only page content; header/footer belong outside as landmarks. Screen-reader landmark navigation is degraded. |
| P3 | No skip-to-content link for keyboard users. |

### 2.2 Announcement bar + header (`site-header.jsx`)
| Sev | Finding |
|---|---|
| ~~P0~~ | ~~Horizontal overflow clipped the Basket button below ~880px~~ — **fixed 7 Jul** (`min-w-0` + `shrink-0` + responsive brand mark). |
| P2 | Announcement bar is static; the backend `settings` and `pricing/promotions` APIs could drive it (e.g. current free-shipping threshold, live promo). Threshold is hardcoded in copy ("over £30") in at least 4 places — one settings change would silently make them all wrong. |
| P2 | Desktop nav row 2 has no active-route indication; users can't tell which section they're in. |
| P2 | `⌘K` hint shows on all platforms; Windows users expect `Ctrl K`. Keyboard shortcut itself is not actually bound — the hint advertises a shortcut that doesn't work. |
| P3 | No mega-menu / category preview on hover; nav items are flat links (fine for now, limiting at Amazon scale). |

### 2.3 Footer (`site-footer.jsx`)
| Sev | Finding |
|---|---|
| P1 | Support entries are plain `<span>`s: "Phone support: 01733887900" and both email addresses are **not clickable** (`tel:`/`mailto:` missing). On mobile this is a dead end at the exact moment a customer wants help. |
| P2 | "Live chat weekdays 8am–4pm" — no chat exists (systemic C). |
| P3 | No payment-method icons, no social links, no newsletter entry point in footer (industry standard for commerce). |

### 2.4 Home page (`page.jsx`)
| Sev | Finding |
|---|---|
| P2 | Hero copy is developer-voiced ("Serious ecommerce for a regulated category", "Structural, not procedural", "faceted product discovery") — it describes the build, not the shopper's benefit. Enterprise stores sell outcomes ("Next-day delivery", "4 for £11"). |
| P2 | "4 for £11" offer card is hardcoded; `pricing/promotions` API exists and should drive it. If the promo changes in admin, the homepage lies. |
| P2 | Category cards render no imagery — text-only tiles for a visual product category. |
| P3 | Best-sellers rail: no horizontal scroll/carousel on mobile; grid pushes content far down. `embla-carousel-react` is already a dependency — unused. |

### 2.5 Brand marquee (`brand-marquee.jsx`)
| Sev | Finding |
|---|---|
| P2 | Ignores `prefers-reduced-motion` — continuous animation with no pause affordance (WCAG 2.2.2). |
| P2 | Brand list is hardcoded; `getBrands()` API exists. New brands added in admin never appear. |
| P3 | Names aren't links to brand-filtered listings — a free navigation win. |

### 2.6 Product card (`product-card.jsx`, `product-visual.jsx`)
| Sev | Finding |
|---|---|
| P1 | No wishlist/save control — yet the account page has a whole Wishlist tab telling users to "Click the heart icon on products". The heart icon does not exist anywhere. |
| P2 | Compare-at savings not badged ("Save £5" appears only if admin sets `badge` manually; the discount is computable). |
| P2 | No strength/format quick info on card for e-liquids (users must open the PDP to see 10mg vs 20mg — the #1 vape purchase question). |
| P3 | No hover secondary image (needs gallery support first — systemic D). |

### 2.7 Shop/browse (`product-browser.jsx`)
| Sev | Finding |
|---|---|
| P1 | `getProducts()` calls have `.finally` but **no `.catch`** — an API failure leaves an unhandled rejection and (for the filter effect) the previous list silently; on first load, endless skeletons. |
| P2 | Filters/sort not in URL (systemic E) — refresh resets everything, filtered pages can't be shared or indexed. |
| P2 | No price-range facet, no strength facet — the two highest-signal filters for this category. Backend facets return formats/flavours/brands only. |
| P2 | Active filters have no removable "chips" row above results; users must reopen groups to unpick. |
| P3 | Infinite scroll only — no "showing X of Y / page" anchor; footer becomes unreachable during load bursts on long catalogues. |

### 2.8 Product detail page (`product/[slug]/page.jsx`)
| Sev | Finding |
|---|---|
| P1 | Breadcrumb shows the raw slug ("e-liquids") instead of the category display name. |
| P1 | "Fact" box renders `value = stock status`, `label = "Dispatch before 2pm"` — reads as "Out of stock / Dispatch before 2pm". Confused mapping. |
| P2 | Single image, no gallery/zoom/thumbnails (systemic D — `galleryUrls` unused). |
| P2 | No stock quantity urgency ("Only 3 left"), no delivery ETA estimate, no share button. |
| P2 | Reviews: read-only. `createReview` API exists; there is no "Write a review" flow anywhere. No pagination or sort on reviews either. |
| P3 | No recently-viewed rail; no sticky add-to-cart bar on mobile scroll. |

### 2.9 Cart (`cart-sheet.jsx`, `cart-view.jsx`)
| Sev | Finding |
|---|---|
| P1 | Cart lines show icon placeholders even for products with photos — `ProductVisual` gets `{ categorySlug: item.category }` only (systemic D). The cart API needs to carry `imageUrl` per line, or the UI should look it up. |
| P2 | No "saved for later", no promo-code entry field anywhere in cart or checkout (promotions module exists!). |
| P3 | No cross-sell rail in the drawer ("Add coils?") — a top revenue lever for this category. |

### 2.10 Checkout (`checkout-flow.jsx`)
| Sev | Finding |
|---|---|
| P0 | **Fake payment step.** Plain inputs collect a card number/expiry/CVC into React state, then... never send them (checkout API takes no payment fields). Customers are typing card numbers into a form that does nothing — a trust and (if ever logged) compliance hazard. Either integrate Stripe Elements or remove the fields and label the step "Pay on dispatch / test mode". |
| P0 | Success screen claims "A confirmation email has been sent" — no email is sent (nodemailer is installed but unwired). |
| P1 | `Field` renders `<Label>` with no `htmlFor`/`id` pairing — labels aren't programmatically associated (a11y + browser autofill). No `autocomplete` attributes (`postal-code`, `street-address`, `cc-number`…), so autofill fails on the highest-friction form in the store. |
| P1 | Logged-in users get no prefill (email/name/address) and orders don't attach to their account view. County field exists in state but has no input. |
| P2 | No postcode lookup (standard UK pattern), no order-tracking link on confirmation, no basket-edit from review step. |

### 2.11 Auth dialogs (`auth-dialogs.jsx`)
Solid: proper labels, autocomplete, password toggle, error banners, loading states. Minor:
| Sev | Finding |
|---|---|
| P2 | No "forgot password" path at all (backend has no reset endpoint either — needs both). |
| P3 | No password-strength meter on signup; error messages from API pass through raw. |

### 2.12 Age gate (`age-gate-dialog.jsx`)
Good: blocking modal, decline state, compliance copy. Minor:
| Sev | Finding |
|---|---|
| P2 | Backdrop click/Escape probably dismisses (Radix default) — should be truly undismissable for compliance. Verify `onPointerDownOutside`/`onEscapeKeyDown` are prevented. |

### 2.13 Search (`search-command.jsx`)
| Sev | Finding |
|---|---|
| P1 | Results show icon placeholders (`ProductVisual` gets full product — actually OK here if search API returns `imageUrl`; verify the search index includes it). |
| P2 | No "view all results" row linking to `/shop?q=…`; the shop page has no query facet at all, so search is trapped in the dialog. |
| P2 | The advertised ⌘K shortcut is not registered (no keydown listener anywhere). |

### 2.14 Account area (`account/*`)
| Sev | Finding |
|---|---|
| ~~P0~~ | ~~Orders/Loyalty tabs never loaded (`user.accessToken` never existed)~~ — **fixed 7 Jul**. |
| P0 | Settings tab is entirely non-functional: "Update Contact Info", "Add Address", "Change Password" buttons do nothing; the notification checkboxes pass `onChange` to a Radix Checkbox (needs `onCheckedChange`) so they don't even toggle visually. No backend endpoints exist for profile update — needs API + UI together, or the tab should be reduced to what's real. |
| P0 | Wishlist tab renders a hardcoded empty array — pure stub, no schema, no API, and (see 2.6) no way to add items. Ship a wishlist end-to-end or remove the tab. |
| P1 | Account menu links to `/account/orders` and `/account/loyalty` — routes that don't exist (single `/account` page with tabs). Both 404. |

### 2.15 Store locator (`store-locator-client.jsx`)
| Sev | Finding |
|---|---|
| P1 | Map area is a permanent placeholder admitting "add API key" to customers. `@react-google-maps/api` is installed and unused. Show the key-gated map or drop the panel. |
| P2 | Uses `alert()` for geolocation errors — jarring, non-brand. Store list uses `store.id` as key (Mongo returns `_id` — verify; a wrong key breaks list reconciliation). |

### 2.16 Contact form (`contact-form.jsx`)
| Sev | Finding |
|---|---|
| P0 | Fake submit: `setTimeout(700)` then "Message sent". No API, no email, no record. Customer messages evaporate. |

### 2.17 Newsletter (`newsletter-panel.jsx`)
| Sev | Finding |
|---|---|
| P0 | Fake subscribe: `if (email.includes("@")) setDone(true)`. No consent stored anywhere — and the copy promises "compliant consent". |

### 2.18 UI primitives (`components/ui/*`)
Radix-based, consistent variants, focus rings, dark-mode aware. **No material issues** — this layer is genuinely good. Watch-outs: `Checkbox` API is `onCheckedChange` (misused once, see 2.14); `Button` variants ending in `!` (important) suggest specificity battles worth cleaning later.

---

## 3. Admin panel — component by component

### 3.1 Shell (`admin-layout.jsx`, `admin-sidebar.jsx`, `admin-header.jsx`)
| Sev | Finding |
|---|---|
| P1 | Header "Quick search…" input is decorative — no state, no results, no action. Dead UI in every admin screen. |
| P2 | Sidebar shows only 5 core + 3 super items while the backend has 22 modules; no Inventory, Promotions, Reviews, CMS, Media, Settings, Audit (Phase 1 scope). |
| P3 | No breadcrumb/title context in header; no keyboard shortcuts. |

### 3.2 Dashboard (`admin/page.jsx`)
Real data, CSV export, date ranges — good. Minor:
| Sev | Finding |
|---|---|
| P2 | Stat cards lack comparison to previous period (trend arrows exist in `StatCard` but dashboard passes none). |
| P3 | No low-stock or pending-orders alert strip — the two things an operator checks first each morning. |

### 3.3 Orders (`orders/*`) — real APIs, filters, pagination, tracking, CSV. Best-in-repo. Minor:
| Sev | Finding |
|---|---|
| P2 | Search is client-side on the current page only, labelled honestly, but server-side search (order number/email param) is the expectation at scale. |
| P2 | No bulk actions (select → dispatch), no printable packing slip/invoice. |

### 3.4 Products (`products/*`) — real, with working image upload. Gaps:
| Sev | Finding |
|---|---|
| P2 | Single image only; `galleryUrls` unsupported in the form (systemic D). |
| P2 | No stock editing (inventory API exists: `PATCH /inventory/:productId/adjust`), no draft state, no bulk import/export. |
| P2 | Collection/format/strength are free-text — typo-prone; should be selects fed by existing values. |

### 3.5 Customers (`customers/page.jsx`)
| Sev | Finding |
|---|---|
| P0 | **100% mock data** (four fictional people). "Export Customers" exports nothing real. Backend has no list-users endpoint yet — needs a small `identity` addition (extend, don't replace RBAC) plus real UI. Until then this page actively misleads. |

### 3.6 Analytics (`analytics/*`)
| Sev | Finding |
|---|---|
| P1 | Three tiles are "coming soon" placeholders (customer insights, conversion funnel, peak times). Either build from existing order data or remove. |

### 3.7 Staff (`super/staff/page.jsx`)
| Sev | Finding |
|---|---|
| P0 | Mock staff list; "Add Staff Member", edit and delete buttons are dead. No backend endpoint for staff CRUD yet. |

### 3.8 Permissions (`super/permissions/page.jsx`)
| Sev | Finding |
|---|---|
| P0 | Displays **invented permission names** ("Process refunds", "System settings") with `defaultChecked` checkboxes and a dead "Save Permissions" button — none of it reflects the real RBAC (`catalogue:write`, `orders:manage`, wildcard `*`). The real APIs (`GET/PATCH /rbac/roles`) already exist and are unused. Dangerous: a super-admin could believe they changed access when nothing happened. |

### 3.9 Reports (`super/reports/page.jsx`)
| Sev | Finding |
|---|---|
| P0 | Fake report cards with fabricated "last generated" timestamps; download buttons dead. Real reporting endpoints exist (`sales-by-day`, `top-products`) and the audit API could feed an activity report. |

### 3.10 Merchant suite (`merchant/*`)
| Sev | Finding |
|---|---|
| P0 | Dashboard stats hardcoded ("284 orders", "£12,480"); Performance and Brand Settings pages same pattern; settings form saves nowhere. Brand-partner accounts see fiction. |

### 3.11 Login (`login/page.jsx`) — real, role-gated, redirects correctly. No issues.

---

## 4. Backend capabilities with **no UI at all** (Phase 1 targets)

| Module | Endpoints ready | Missing UI |
|---|---|---|
| Inventory | `GET /inventory/:productId`, `PATCH …/adjust` | Stock view/adjust in Products |
| Pricing/Promotions | `GET/POST/PATCH /pricing` | Promotions manager |
| Reviews | `GET /reviews`, `DELETE /reviews/:id` | Moderation queue |
| CMS | `GET /cms/pages`, `PUT /cms/pages/:slug` | Page editor |
| Media | `GET /media` | Media library |
| Settings | `GET /settings`, `PATCH /settings/:key` | Store settings screen |
| Audit | `GET /audit`, `GET /audit/:id` | Audit log viewer |
| Compliance | `GET/PATCH /compliance/rules` | Compliance rules screen |
| Integrations | `GET/POST/PATCH /integrations` | Integrations screen |
| Shipping | `GET /shipping/methods` | (read-only reference) |
| RBAC | `GET/POST/PATCH /rbac/roles` | Real permissions editor (replace 3.8) |

---

## 5. What is already good (keep and build on)

- **UI primitive layer**: consistent Radix + CVA system, proper focus management, dark mode.
- **Orders admin**: the reference implementation for every new admin page.
- **Product form dialog**: correct upload pipeline, validation, error surfaces.
- **Auth dialogs & age gate**: strongest UX writing in the storefront.
- **Design language**: spacing, radii, and type scale are coherent across ~60 components; dark theme is thorough.
- **Cart/checkout state machine**: server-backed cart with optimistic UI and free-shipping meter.

## 6. Priority order (recommended)

1. **P0 deceptive surfaces** — admin mock pages (Customers, Staff, Permissions, Reports, Merchant), fake checkout payment, fake contact/newsletter forms, false email claim.
2. **P1 dead ends** — footer contact links, account menu 404s, wishlist promise, admin quick search, product browser error handling, checkout label/autocomplete wiring.
3. **Phase 1 build-out** — the §4 table (backend-ready admin modules).
4. **P2 UX debt** — URL-synced filters, gallery images end-to-end, review submission, promo-code entry, settings-driven announcement bar.
5. **P3 polish** — carousels, mega-menu, cross-sells, recently viewed.
