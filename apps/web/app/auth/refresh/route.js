import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  publicApi,
} from "@/lib/auth";

/**
 * Session refresh hop. Server Components cannot set cookies, so when a
 * page finds the access token expired it redirects here; this handler
 * rotates the refresh token, re-sets both cookies, and bounces back.
 * Rotation failure clears the session and lands on sign-in.
 */
export async function GET(request) {
  const url = new URL(request.url);
  // Same-origin relative paths only — an absolute URL here would be an
  // open-redirect vector.
  const nextParam = url.searchParams.get("next") ?? "/account";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//")
    ? nextParam
    : "/account";

  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  try {
    const tokens = await publicApi("/auth/refresh", {
      body: { refreshToken },
    });

    const response = NextResponse.redirect(new URL(next, url.origin));
    const base = {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    };
    response.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
      ...base,
      maxAge: tokens.expiresIn,
    });
    response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
      ...base,
      maxAge: 30 * 24 * 60 * 60,
    });
    return response;
  } catch {
    const response = NextResponse.redirect(new URL("/login", url.origin));
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
    return response;
  }
}
