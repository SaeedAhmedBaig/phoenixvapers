import Link from "next/link";

import { OPERATOR_ROLES, OPERATOR_ROLE_LABELS as ROLE_LABEL } from "@phoenix/utils/rbac";

import { createStaffAction, setStaffStatusAction } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { operatorApi, requireOperator } from "@/lib/admin";

export const metadata = { title: "Staff" };

// Role options derive from the shared source of truth (no local duplication).
const ROLES = OPERATOR_ROLES.map((value) => [value, ROLE_LABEL[value]]);

export default async function StaffPage({ searchParams }) {
  // Belt and braces: the layout already gated, but this page is admin-only.
  await requireOperator();
  const sp = await searchParams;
  const { items = [] } = (await operatorApi("/admin/operators")) ?? {};

  return (
    <div className="space-y-8">
      <div>
        <p className="text-pine text-xs font-semibold tracking-widest uppercase">Access control</p>
        <h1 className="font-display mt-1 text-2xl font-medium sm:text-3xl">Staff accounts</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Create logins for merchandisers, compliance officers, and platform admins. Segregation of duties is enforced by role.
        </p>
      </div>

      {sp?.error ? <p className="border-destructive/40 bg-destructive/5 text-destructive border px-4 py-2 text-sm" role="alert">{sp.error}</p> : null}
      {sp?.saved ? <p className="border-primary/30 bg-primary/5 text-pine border px-4 py-2 text-sm">Saved.</p> : null}

      <Card className="rounded-none shadow-sm">
        <CardHeader><CardTitle className="text-lg">Existing staff</CardTitle></CardHeader>
        <CardContent>
          <ul className="divide-border border-border divide-y border-y text-sm">
            {items.map((op) => (
              <li key={op.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <Link href={`/admin/staff/${op.id}`} className="hover:underline">
                  <p className="font-medium">{op.firstName} {op.lastName}</p>
                  <p className="text-muted-foreground text-xs">{op.email}</p>
                </Link>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{ROLE_LABEL[op.role] ?? op.role}</Badge>
                  <Badge variant={op.status === "active" ? "default" : "destructive"}>{op.status}</Badge>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/admin/staff/${op.id}`}>Manage</Link>
                  </Button>
                  <form action={setStaffStatusAction}>
                    <input type="hidden" name="id" value={op.id} />
                    <input type="hidden" name="action" value={op.status === "active" ? "suspend" : "activate"} />
                    <Button type="submit" size="sm" variant="ghost">
                      {op.status === "active" ? "Suspend" : "Activate"}
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="rounded-none shadow-sm">
        <CardHeader><CardTitle className="text-lg">Create staff account</CardTitle></CardHeader>
        <CardContent>
          <form action={createStaffAction} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Temporary password</Label>
              <PasswordInput id="password" name="password" minLength={10} required />
              <p className="text-muted-foreground text-xs">At least 10 characters.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                name="role"
                required
                defaultValue="merchandiser"
                className="border-input bg-card h-10 w-full rounded-none border px-3 text-sm"
              >
                {ROLES.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Create account</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
