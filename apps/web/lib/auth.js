/**
 * Customer session — BFF pattern, SERVER-SIDE ONLY.
 *
 * Tokens live in httpOnly cookies on the storefront origin and are
 * attached to API calls here, on the server. They never reach browser
 * JavaScript (no localStorage, no client state), so token theft via XSS
 * is structurally off the table (§16.4).
 */
import "server-only";

import { cookies } from "next/headers";

const API_URL = process.env.API_URL ?? "http://localhost:4000/v1";

export const ACCESS_COOKIE = "phx_access";
export const REFRESH_COOKIE = "phx_refresh";
/**
 * Which kind of principal this session belongs to ("customer" | "operator").
 * NOT a security control — the API remains the sole authority (every admin
 * read is re-checked server-side). It only lets the storefront route the
 * account affordance without an extra round-trip.
 */
export const PRINCIPAL_COOKIE = "phx_principal";

const BASE_COOKIE = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

/** Persist a token pair (and the principal type) from the API into cookies. */
export async function setSession(tokens, principalType = "customer") {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, tokens.accessToken, {
    ...BASE_COOKIE,
    maxAge: tokens.expiresIn,
  });
  jar.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...BASE_COOKIE,
    maxAge: 30 * 24 * 60 * 60,
  });
  jar.set(PRINCIPAL_COOKIE, principalType, {
    ...BASE_COOKIE,
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
  jar.delete(PRINCIPAL_COOKIE);
}

/** Cookie presence — enough for nav display; the API is the authority. */
export async function sessionState() {
  const jar = await cookies();
  return {
    hasAccess: jar.has(ACCESS_COOKIE),
    hasRefresh: jar.has(REFRESH_COOKIE),
    principalType: jar.get(PRINCIPAL_COOKIE)?.value ?? "customer",
  };
}

/**
 * Call a customer-authenticated API endpoint with the session's access
 * token. Throws on failure; 401 surfaces as `AuthRequiredError` so pages
 * can redirect through the refresh route.
 */
export class AuthRequiredError extends Error {
  constructor() {
    super("Sign-in required");
    this.name = "AuthRequiredError";
  }
}

export async function customerApi(path, { method = "GET", body } = {}) {
  const jar = await cookies();
  const access = jar.get(ACCESS_COOKIE)?.value;
  if (!access) throw new AuthRequiredError();

  const response = await fetch(`${API_URL}${path}`, {
    method,
    cache: "no-store",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${access}`,
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (response.status === 401) throw new AuthRequiredError();

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
    throw new Error(detail || `Request failed (${response.status})`);
  }

  return response.status === 204 ? null : response.json();
}

/** Unauthenticated API call (register/login/refresh). */
export async function publicApi(path, { method = "POST", body } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    cache: "no-store",
    headers: {
      accept: "application/json",
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const payload = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.message;
    throw new Error(
      (Array.isArray(message) ? message.join(", ") : message) ||
        `Request failed (${response.status})`,
    );
  }

  return payload;
}
