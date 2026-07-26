/**
 * Typed-ish API client for the storefront (Server Components only).
 *
 * The API base URL is a SERVER environment variable — it is never shipped
 * to the browser; all data fetching happens in React Server Components
 * (spec §16.8). Network failures return null so pages can degrade
 * gracefully when the API is not running (common in local dev).
 */

const API_URL = process.env.API_URL ?? "http://localhost:4000/v1";

/** Safe fallback when the API is unreachable or returns nothing useful. */
export const EMPTY_PRODUCT_LIST = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 24,
  facets: {},
};

function isNetworkError(error) {
  const code = error?.cause?.code ?? error?.code;
  return code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "ECONNRESET";
}

/**
 * GET a JSON resource from the Phoenix API.
 *
 * @param {string} path - e.g. "/products?category=nic-salts"
 * @param {{ revalidate?: number }} [options] - ISR cache window (seconds)
 * @returns {Promise<object|null>} Parsed JSON, or null on 404 / network failure
 */
export async function apiGet(path, { revalidate = 60 } = {}) {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      next: { revalidate },
      headers: { accept: "application/json" },
    });

    if (response.status === 404) return null;

    if (!response.ok) {
      throw new Error(`API request failed (${response.status}) for ${path}`);
    }

    return response.json();
  } catch (error) {
    if (isNetworkError(error)) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[web] API unreachable at ${API_URL} — start it with: pnpm dev:api`,
        );
      }
      return null;
    }
    throw error;
  }
}
