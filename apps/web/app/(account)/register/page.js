import { AuthPanel } from "@/components/account/auth-panel";

export const metadata = { title: "Create account" };

export default async function RegisterPage({ searchParams }) {
  const { error } = await searchParams;

  return <AuthPanel mode="signup" error={error} />;
}
