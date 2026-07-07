/**
 * Cross-site cookie attributes. The storefront (Vercel) and the API (Render)
 * run on different sites, so browsers only round-trip httpOnly cookies when
 * they are marked SameSite=None; Secure. Lax is kept for local development,
 * where Secure cookies would be rejected on plain http://localhost.
 */
export function crossSiteCookieOptions(): { sameSite: "lax" | "none"; secure: boolean } {
  return process.env.NODE_ENV === "production"
    ? { sameSite: "none", secure: true }
    : { sameSite: "lax", secure: false };
}
