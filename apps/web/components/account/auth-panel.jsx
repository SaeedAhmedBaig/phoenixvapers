import Link from "next/link";

import { loginAction, registerAction } from "@/app/(account)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";

/**
 * Unified authentication surface (§6.1, §16.3) — one screen carrying both
 * Sign in and Create account behind a segmented switch. The two routes
 * (/login, /register) render this same panel with the matching tab active,
 * so error redirects and deep-links keep working while the customer sees a
 * single, consistent screen. One login serves customers AND operators; the
 * server resolves the principal and routes staff to the console.
 */
export function AuthPanel({ mode = "signin", error, next = "" }) {
  const isSignin = mode === "signin";
  // Preserve a post-login destination across the tab switch.
  const signinHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-12">
      <div className="phx-card w-full p-6 sm:p-8">
        <p className="phx-eyebrow">Account</p>
        <h1 className="font-display mt-2 text-2xl font-medium">
          {isSignin ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isSignin
            ? "Sign in to your Phoenix account."
            : "18+ only. Age verification is required before your first order."}
        </p>

        {/* Segmented switch — two routes styled as one control. */}
        <div className="border-border mt-6 grid grid-cols-2 border" role="group" aria-label="Sign in or create an account">
          <Link
            href={signinHref}
            aria-current={isSignin ? "page" : undefined}
            className={cn(
              "px-4 py-2.5 text-center text-sm font-medium transition-colors",
              isSignin ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted",
            )}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            aria-current={!isSignin ? "page" : undefined}
            className={cn(
              "border-border border-l px-4 py-2.5 text-center text-sm font-medium transition-colors",
              !isSignin ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted",
            )}
          >
            Create account
          </Link>
        </div>

        {error ? (
          <p className="border-destructive/40 bg-destructive/5 text-destructive mt-5 border px-3 py-2 text-sm" role="alert">
            {error}
          </p>
        ) : null}

        {isSignin ? (
          <form action={loginAction} className="mt-6 space-y-4">
            {next ? <input type="hidden" name="next" value={next} /> : null}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" name="password" autoComplete="current-password" required />
            </div>
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
        ) : (
          <form action={registerAction} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" name="firstName" autoComplete="given-name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" name="lastName" autoComplete="family-name" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of birth</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" name="password" autoComplete="new-password" minLength={10} required />
              <p className="text-muted-foreground text-xs">At least 10 characters with letters and numbers.</p>
            </div>
            <Button type="submit" className="w-full">Create account</Button>
          </form>
        )}

        <p className="text-muted-foreground mt-6 text-center text-sm">
          {isSignin ? (
            <>New to Phoenix? <Link href="/register" className="text-pine font-medium hover:underline">Create an account</Link></>
          ) : (
            <>Already registered? <Link href={signinHref} className="text-pine font-medium hover:underline">Sign in</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
