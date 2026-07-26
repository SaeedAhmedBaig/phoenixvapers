import { AuthPanel } from "@/components/account/auth-panel";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }) {
  const { error, next } = await searchParams;
  // Only same-origin relative paths survive as a post-login destination.
  const safeNext =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "";

  return <AuthPanel mode="signin" error={error} next={safeNext} />;
}
