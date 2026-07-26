/**
 * Basket BFF — SERVER-SIDE ONLY (spec §6.2, §16.8).
 *
 * The storefront never talks to the cart API from the browser. Credentials
 * live in httpOnly cookies on the storefront origin and are attached here,
 * on the server:
 *
 *   - a signed-in customer sends their access JWT (the API prioritises it);
 *   - a guest sends an opaque cart token (`phx_cart`) — 64 hex chars minted
 *     by the API on the first write and stored in an httpOnly cookie the
 *     browser JS can never read (§6.2: the raw token is never exposed).
 *
 * The cart endpoints use an OPTIONAL auth guard, so a single client can
 * serve both audiences: we attach whichever credentials exist and let the
 * API decide. Network failures degrade to an empty basket so shop pages
 * still render when the API is down in local dev.
 */
import "server-only";

import { cookies } from "next/headers";

import { ACCESS_COOKIE } from "@/lib/auth";

const API_URL = process.env.API_URL ?? "http://localhost:4000/v1";

/** Guest basket token — httpOnly, same lifetime as the API's 60-day reap. */
export const CART_COOKIE = "phx_cart";

/** Line kinds (mirrors the API's cart PurchaseType enum, §6.2). */
export const PurchaseType = {
  ONE_OFF: "one-off",
  SUBSCRIPTION: "subscription",
};

const CART_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 24 * 60 * 60,
};

/** An empty basket — the safe fallback shape the UI can always render. */
export const EMPTY_CART = {
  lines: [],
  itemCount: 0,
  totals: { netMinor: 0, dutyMinor: 0, vatMinor: 0, totalMinor: 0 },
  needsAttention: false,
};

function isNetworkError(error) {
  const code = error?.cause?.code ?? error?.code;
  return code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "ECONNRESET";
}

/**
 * Call a cart endpoint with whatever credentials the session carries.
 * Returns the parsed `CartResult` (`{ cart, cartToken? }`) or throws with a
 * readable message on a non-network API error.
 */
async function cartApi(path, { method = "GET", body } = {}) {
  const jar = await cookies();
  const access = jar.get(ACCESS_COOKIE)?.value;
  const cartToken = jar.get(CART_COOKIE)?.value;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    cache: "no-store",
    headers: {
      accept: "application/json",
      ...(access ? { authorization: `Bearer ${access}` } : {}),
      // A signed-in customer never needs the guest token; sending it is
      // harmless (the API ignores it) but we omit it to keep intent clear.
      ...(!access && cartToken ? { "x-cart-token": cartToken } : {}),
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    let detail = "";
    try {
      const payload = await response.json();
      if (payload?.message) {
        detail = Array.isArray(payload.message)
          ? payload.message.join(", ")
          : String(payload.message);
      }
    } catch {
      /* status alone will do */
    }
    throw new Error(detail || `Basket request failed (${response.status})`);
  }

  return response.status === 204 ? null : response.json();
}

/**
 * The current priced basket for display (basket page, header badge).
 * Read-only: safe to call from Server Components. Degrades to an empty
 * basket on network failure so a stopped API never breaks the storefront.
 */
export async function readCart() {
  try {
    const result = await cartApi("/cart");
    return result?.cart ?? EMPTY_CART;
  } catch (error) {
    if (isNetworkError(error)) return EMPTY_CART;
    throw error;
  }
}

/** Just the header badge number — never throws. */
export async function getCartCount() {
  try {
    const cart = await readCart();
    return cart.itemCount ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Persist a freshly minted guest cart token (write context only — Server
 * Actions / Route Handlers). No-op for signed-in customers, who never
 * receive one.
 */
export async function persistGuestCartToken(token) {
  if (!token) return;
  const jar = await cookies();
  jar.set(CART_COOKIE, token, CART_COOKIE_OPTIONS);
}

/** Drop the guest cart cookie (after merge into an account, or on logout). */
export async function clearGuestCartCookie() {
  const jar = await cookies();
  jar.delete(CART_COOKIE);
}

/**
 * A cart mutation from a Server Action. Attaches credentials, and if the
 * API minted a guest token (first guest write), stores it in the cookie so
 * the next request finds the same basket.
 */
export async function mutateCart(path, { method, body } = {}) {
  const result = await cartApi(path, { method, body });
  if (result?.cartToken) await persistGuestCartToken(result.cartToken);
  return result?.cart ?? EMPTY_CART;
}

/**
 * Fold a guest basket into the account right after sign-in (§6.2). Called
 * with the just-issued access token because the session cookie may not be
 * readable back within the same request that set it. A missing/empty guest
 * cart is a no-op success — the login flow calls this unconditionally.
 */
export async function mergeGuestCartAfterLogin(accessToken) {
  const jar = await cookies();
  const cartToken = jar.get(CART_COOKIE)?.value;
  if (!cartToken) return;

  try {
    await fetch(`${API_URL}/cart/merge`, {
      method: "POST",
      cache: "no-store",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ cartToken }),
    });
  } catch {
    // A failed merge must never block sign-in; the guest basket simply
    // stays behind. Sign-in succeeding is the priority.
  }

  // The guest token is spent whether or not the merge round-trip worked —
  // the customer cart is now authoritative.
  jar.delete(CART_COOKIE);
}
