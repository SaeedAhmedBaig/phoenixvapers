const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

/**
 * Thin fetch wrapper for the Phoenix Vapers NestJS API. `credentials:
 * "include"` is required on every call so the guest-cart and refresh-token
 * httpOnly cookies round-trip correctly between the Next.js origin and the
 * API origin.
 */
export async function apiFetch(path, options = {}) {
  const { accessToken, ...rest } = options;
  const headers = { ...(rest.headers || {}) };
  if (rest.body && !(rest.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
    credentials: "include",
    cache: rest.cache ?? "no-store",
  });

  const contentType = res.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json") ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ApiError(data?.message || res.statusText, res.status, data);
  }
  return data;
}

function query(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/* Catalogue */
export const getCategories = () => apiFetch("/catalogue/categories");
export const getBrands = () => apiFetch("/catalogue/brands");
export const getProducts = (params) => apiFetch(`/catalogue/products${query(params)}`);
export const getProduct = (slug) => apiFetch(`/catalogue/products/${slug}`);
export const getRelatedProducts = (slug) => apiFetch(`/catalogue/products/${slug}/related`);

/* Pricing / shipping / tax */
export const getPromotions = () => apiFetch("/pricing/promotions");
export const getShippingMethods = () => apiFetch("/shipping/methods");

/* CMS */
export const getPage = (slug) => apiFetch(`/cms/pages/${slug}`);
export const getPages = () => apiFetch("/cms/pages");

/* Search */
export const searchProducts = (q) => apiFetch(`/search${query({ q })}`);

/* Store locator */
export const getStores = (postcode) => apiFetch(`/stores${query({ postcode })}`);

/* Reviews */
export const getReviews = (productSlug, params) => apiFetch(`/reviews${query({ product: productSlug, ...params })}`);
export const createReview = (dto, accessToken) =>
  apiFetch("/reviews", { method: "POST", body: JSON.stringify(dto), accessToken });

/* Cart */
export const getCart = (shippingMethod) => apiFetch(`/cart${query({ shippingMethod })}`);
export const addCartItem = (dto) => apiFetch("/cart/items", { method: "POST", body: JSON.stringify(dto) });
export const updateCartItem = (itemId, qty) =>
  apiFetch(`/cart/items/${itemId}`, { method: "PATCH", body: JSON.stringify({ qty }) });
export const removeCartItem = (itemId) => apiFetch(`/cart/items/${itemId}`, { method: "DELETE" });
export const clearCart = () => apiFetch("/cart", { method: "DELETE" });

/* Compliance */
export const recordAgeVerification = (dto) =>
  apiFetch("/compliance/age-verification", { method: "POST", body: JSON.stringify(dto) });

/* Checkout / orders */
export const submitCheckout = (dto) => apiFetch("/checkout", { method: "POST", body: JSON.stringify(dto) });
export const getMyOrders = (accessToken, params) =>
  apiFetch(`/orders/me${query(params)}`, { accessToken });
export const getOrder = (orderNumber, accessToken) => apiFetch(`/orders/${orderNumber}`, { accessToken });

/* Loyalty */
export const getMyLoyalty = (accessToken) => apiFetch("/loyalty/me", { accessToken });
export const redeemLoyaltyPoints = (points, accessToken) =>
  apiFetch("/loyalty/redeem", { method: "POST", body: JSON.stringify({ points }), accessToken });

/* Auth */
export const registerAccount = (dto) => apiFetch("/auth/register", { method: "POST", body: JSON.stringify(dto) });
export const loginAccount = (dto) => apiFetch("/auth/login", { method: "POST", body: JSON.stringify(dto) });
export const refreshSession = () => apiFetch("/auth/refresh", { method: "POST" });
export const logoutAccount = () => apiFetch("/auth/logout", { method: "POST" });
export const getMe = (accessToken) => apiFetch("/auth/me", { accessToken });

/* Admin: orders */
export const adminListOrders = (accessToken, params) => apiFetch(`/orders${query(params)}`, { accessToken });
export const adminUpdateOrderStatus = (orderNumber, dto, accessToken) =>
  apiFetch(`/orders/${orderNumber}/status`, { method: "PATCH", body: JSON.stringify(dto), accessToken });

/* Admin: catalogue */
export const adminCreateProduct = (dto, accessToken) =>
  apiFetch("/catalogue/products", { method: "POST", body: JSON.stringify(dto), accessToken });
export const adminUpdateProduct = (slug, dto, accessToken) =>
  apiFetch(`/catalogue/products/${slug}`, { method: "PATCH", body: JSON.stringify(dto), accessToken });
export const adminDeleteProduct = (slug, accessToken) =>
  apiFetch(`/catalogue/products/${slug}`, { method: "DELETE", accessToken });

/* Admin: RBAC */
export const adminListRoles = (accessToken) => apiFetch("/rbac/roles", { accessToken });
export const adminUpdateRole = (name, dto, accessToken) =>
  apiFetch(`/rbac/roles/${name}`, { method: "PATCH", body: JSON.stringify(dto), accessToken });

/* Admin: audit */
export const adminListAudit = (accessToken, params) => apiFetch(`/audit${query(params)}`, { accessToken });

/* Admin: settings */
export const adminListSettings = (accessToken) => apiFetch("/settings", { accessToken });
export const adminUpdateSetting = (key, dto, accessToken) =>
  apiFetch(`/settings/${key}`, { method: "PATCH", body: JSON.stringify(dto), accessToken });

/* Admin: compliance */
export const adminListComplianceRules = () => apiFetch("/compliance/rules");
export const adminUpdateComplianceRule = (key, dto, accessToken) =>
  apiFetch(`/compliance/rules/${key}`, { method: "PATCH", body: JSON.stringify(dto), accessToken });

/* Admin: reporting */
export const adminSalesByDay = (accessToken, params) =>
  apiFetch(`/reporting/sales-by-day${query(params)}`, { accessToken });
export const adminTopProducts = (accessToken, params) =>
  apiFetch(`/reporting/top-products${query(params)}`, { accessToken });

/* Admin: stores */
export const adminCreateStore = (dto, accessToken) =>
  apiFetch("/stores", { method: "POST", body: JSON.stringify(dto), accessToken });
