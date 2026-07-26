import Link from "next/link";
import { redirect } from "next/navigation";

import { VerificationPanel } from "@/components/account/verification-panel";
import { AuthRequiredError, customerApi } from "@/lib/auth";

export const metadata = { title: "Age verification" };

export default async function VerifyPage({ searchParams }) {
  const sp = await searchParams;
  let verification;

  try {
    verification = await customerApi("/verification/status");
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect(`/auth/refresh?next=${encodeURIComponent("/verify")}`);
    }
    throw error;
  }

  if (verification?.status === "passed") {
    redirect("/account");
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      {sp.error ? <p className="text-destructive mb-6 text-sm" role="alert">{sp.error}</p> : null}
      {sp.saved ? (
        <p className="border-primary/30 bg-primary/5 text-pine mb-6 border px-4 py-2 text-sm">
          Verification updated — see your status below.
        </p>
      ) : null}

      <VerificationPanel verification={verification} />

      <p className="text-muted-foreground mt-8 text-center text-sm">
        <Link href="/account" className="text-pine hover:underline">Back to account</Link>
      </p>
    </div>
  );
}
