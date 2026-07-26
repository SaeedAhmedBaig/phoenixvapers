"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import {
  REFRESH_COOKIE,
  clearSession,
  customerApi,
  publicApi,
  setSession,
} from "@/lib/auth";
import { mergeGuestCartAfterLogin } from "@/lib/cart";

function redirectWithError(path, message) {
  const url = new URL(path, "http://local");
  url.searchParams.set("error", message);
  redirect(`${url.pathname}?${url.searchParams.toString()}`);
}

/** Same-origin relative paths only — guard against open-redirect. */
function safeNext(value, fallback) {
  return value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export async function registerAction(formData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "");

  // redirect() throws NEXT_REDIRECT, so it must live OUTSIDE the try/catch
  // or the catch would swallow the successful navigation (Next docs).
  let result;
  try {
    result = await publicApi("/auth/register", {
      body: { email, password, firstName, lastName, dateOfBirth },
    });
  } catch (error) {
    redirectWithError("/register", error.message ?? "Registration failed");
    return;
  }
  await setSession(result);
  // Carry a guest basket over into the new account (§6.2).
  await mergeGuestCartAfterLogin(result.accessToken);
  redirect("/account/verify");
}

export async function loginAction(formData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  // Optional post-login destination (e.g. basket → /checkout).
  const next = safeNext(String(formData.get("next") ?? ""), "/account");

  let result;
  try {
    result = await publicApi("/auth/login", { body: { email, password } });
  } catch (error) {
    redirectWithError("/login", error.message ?? "Sign-in failed");
    return;
  }

  const isOperator = result.principalType === "operator";
  await setSession(result, result.principalType);

  if (isOperator) {
    // Staff go straight to the console; they have no basket to merge.
    redirect("/admin");
  }
  // Fold any guest basket into the account before landing (§6.2).
  await mergeGuestCartAfterLogin(result.accessToken);
  redirect(next);
}

export async function logoutAction() {
  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    try {
      await publicApi("/auth/logout", { body: { refreshToken } });
    } catch {
      /* session ends locally regardless */
    }
  }
  await clearSession();
  redirect("/login");
}

// Each mutation calls its success redirect() AFTER the try/catch. redirect()
// throws NEXT_REDIRECT as control flow; inside a try it would be caught and
// re-surfaced as a bogus "NEXT_REDIRECT" error to the user (Next docs).

export async function updateProfileAction(formData) {
  try {
    await customerApi("/me", {
      method: "PATCH",
      body: {
        firstName: String(formData.get("firstName") ?? "").trim(),
        lastName: String(formData.get("lastName") ?? "").trim(),
      },
    });
  } catch (error) {
    redirectWithError("/account", error.message ?? "Update failed");
    return;
  }
  redirect("/account?saved=profile");
}

export async function addAddressAction(formData) {
  try {
    await customerApi("/me/addresses", {
      method: "POST",
      body: {
        label: String(formData.get("label") ?? "").trim(),
        line1: String(formData.get("line1") ?? "").trim(),
        line2: String(formData.get("line2") ?? "").trim() || undefined,
        city: String(formData.get("city") ?? "").trim(),
        postcode: String(formData.get("postcode") ?? "").trim().toUpperCase(),
        country: "GB",
      },
    });
  } catch (error) {
    redirectWithError("/account", error.message ?? "Could not add address");
    return;
  }
  redirect("/account?saved=address");
}

export async function removeAddressAction(formData) {
  const index = Number(formData.get("index"));
  try {
    await customerApi(`/me/addresses/${index}`, { method: "DELETE" });
  } catch (error) {
    redirectWithError("/account", error.message ?? "Could not remove address");
    return;
  }
  redirect("/account?saved=address");
}

export async function updateConsentsAction(formData) {
  try {
    await customerApi("/me/consents", {
      method: "PUT",
      body: { marketingEmail: formData.get("marketingEmail") === "on" },
    });
  } catch (error) {
    redirectWithError("/account", error.message ?? "Could not update preferences");
    return;
  }
  redirect("/account?saved=consents");
}

export async function initiateVerificationAction() {
  try {
    await customerApi("/verification/initiate", { method: "POST" });
  } catch (error) {
    redirectWithError("/account", error.message ?? "Verification could not start");
    return;
  }
  redirect("/account/verify?saved=1");
}

export async function escalateVerificationAction() {
  try {
    await customerApi("/verification/escalate", { method: "POST" });
  } catch (error) {
    redirectWithError("/account", error.message ?? "Escalation failed");
    return;
  }
  redirect("/account/verify?saved=1");
}
