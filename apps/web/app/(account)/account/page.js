import Link from "next/link";
import { redirect } from "next/navigation";

import {
  addAddressAction,
  logoutAction,
  removeAddressAction,
  updateConsentsAction,
  updateProfileAction,
} from "../actions";
import { VerificationPanel } from "@/components/account/verification-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AuthRequiredError, customerApi } from "@/lib/auth";

export const metadata = { title: "My account" };

export default async function AccountPage({ searchParams }) {
  const sp = await searchParams;
  let customer;
  let verification;

  try {
    customer = await customerApi("/me");
    verification = await customerApi("/verification/status");
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect(`/auth/refresh?next=${encodeURIComponent("/account")}`);
    }
    throw error;
  }

  const avStatus = verification?.status ?? "unverified";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-pine text-xs font-semibold tracking-widest uppercase">Account</p>
          <h1 className="font-display mt-2 text-3xl font-medium">Hello, {customer.firstName}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{customer.email}</p>
        </div>
        <form action={logoutAction}><Button variant="outline" type="submit">Sign out</Button></form>
      </div>

      {sp.error ? <p className="text-destructive mb-6 text-sm" role="alert">{sp.error}</p> : null}
      {sp.saved ? <p className="border-primary/30 bg-primary/5 text-pine mb-6 border px-4 py-2 text-sm">Changes saved.</p> : null}

      <Card className="mb-6">
        <CardContent className="flex items-center justify-between gap-4 py-4">
          <div>
            <p className="font-medium">My orders</p>
            <p className="text-muted-foreground text-sm">Track and review everything you&apos;ve ordered.</p>
          </div>
          <Button asChild variant="outline"><Link href="/account/orders">View orders</Link></Button>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Age verification</CardTitle>
          <CardDescription>Required before your first order — we store outcomes only, never identity documents.</CardDescription>
        </CardHeader>
        <CardContent>
          <VerificationPanel verification={verification} compact />
          {avStatus !== "passed" ? (
            <p className="text-muted-foreground mt-4 text-sm">
              <Link href="/verify" className="text-pine font-medium hover:underline">Open full verification guide →</Link>
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-lg">Profile</CardTitle></CardHeader>
        <CardContent>
          <form action={updateProfileAction} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" defaultValue={customer.firstName} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" defaultValue={customer.lastName} required />
            </div>
            <div className="sm:col-span-2"><Button type="submit">Save profile</Button></div>
          </form>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-lg">Addresses</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {customer.addresses?.length ? (
            <ul className="divide-y border text-sm">
              {customer.addresses.map((a, i) => (
                <li key={i} className="flex items-start justify-between gap-4 px-4 py-3">
                  <div>
                    <p className="font-medium">{a.label}</p>
                    <p className="text-muted-foreground">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.postcode}</p>
                  </div>
                  <form action={removeAddressAction}>
                    <input type="hidden" name="index" value={i} />
                    <Button type="submit" variant="ghost" size="sm">Remove</Button>
                  </form>
                </li>
              ))}
            </ul>
          ) : <p className="text-muted-foreground text-sm">No saved addresses yet.</p>}

          <Separator />
          <form action={addAddressAction} className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="label">Label</Label><Input id="label" name="label" placeholder="Home" required /></div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="line1">Address line 1</Label><Input id="line1" name="line1" required /></div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="line2">Address line 2</Label><Input id="line2" name="line2" /></div>
            <div className="space-y-2"><Label htmlFor="city">City</Label><Input id="city" name="city" required /></div>
            <div className="space-y-2"><Label htmlFor="postcode">Postcode</Label><Input id="postcode" name="postcode" required /></div>
            <div className="sm:col-span-2"><Button type="submit" variant="outline">Add address</Button></div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Preferences</CardTitle></CardHeader>
        <CardContent>
          <form action={updateConsentsAction} className="flex items-center gap-3">
            <input type="checkbox" id="marketingEmail" name="marketingEmail" defaultChecked={customer.consents?.marketingEmail} className="size-4 border" />
            <Label htmlFor="marketingEmail" className="font-normal">Email me offers and new product updates</Label>
            <Button type="submit" size="sm" className="ml-auto">Save</Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-muted-foreground mt-8 text-center text-sm">
        <Link href="/" className="text-pine hover:underline">Continue shopping</Link>
      </p>
    </div>
  );
}
