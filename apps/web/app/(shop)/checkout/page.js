import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import { SectionEyebrow } from "@/components/home/section-eyebrow";
import { Button } from "@/components/ui/button";
import { AuthRequiredError, customerApi } from "@/lib/auth";

export const metadata = { title: "Checkout" };

/**
 * Checkout (spec §6.3). Customer-only: the basket is reachable by guests,
 * but money is not. Everything the page needs — the revalidated basket,
 * saved addresses, and basket-priced delivery options — comes from one
 * authenticated read. The server enforces age verification and compliance
 * fail-closed when the order is placed; the age gate here is UX, not the
 * control.
 */
export default async function CheckoutPage() {
  let context;
  let verification;

  try {
    context = await customerApi("/checkout/context");
    verification = await customerApi("/verification/status");
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect(`/auth/refresh?next=${encodeURIComponent("/checkout")}`);
    }
    // The API refuses an empty or stale basket — send the shopper back to
    // fix it where the issues are shown, rather than dead-ending here.
    const message = error?.message ?? "";
    if (/empty|no longer available|review your basket/i.test(message)) {
      redirect("/basket");
    }
    throw error;
  }

  const avPassed = (verification?.status ?? "unverified") === "passed";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <SectionEyebrow>Secure checkout</SectionEyebrow>
      <h1 className="font-display mt-2 text-3xl font-medium">Checkout</h1>

      {avPassed ? (
        <div className="mt-8">
          <CheckoutForm context={context} />
        </div>
      ) : (
        <div className="border-border bg-card mt-8 max-w-xl border p-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="text-destructive mt-0.5 size-5 shrink-0" />
            <div>
              <h2 className="font-medium">Age verification required</h2>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                UK law requires us to confirm you are 18 or over before we can sell you vaping products. Your basket is saved — complete verification and come straight back to checkout.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild className="rounded-none"><Link href="/verify">Verify my age</Link></Button>
                <Button asChild variant="outline" className="rounded-none"><Link href="/basket">Back to basket</Link></Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
