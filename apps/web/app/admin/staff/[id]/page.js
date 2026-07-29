import Link from "next/link";
import { notFound } from "next/navigation";

import { OPERATOR_ROLES, OPERATOR_ROLE_LABELS as ROLE_LABEL } from "@phoenix/utils/rbac";

import { resetStaffPasswordAction, setStaffStatusAction, updateStaffAction } from "../actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { operatorApi, requireOperator } from "@/lib/admin";

export const metadata = { title: "Staff account" };

const ROLES = OPERATOR_ROLES.map((value) => [value, ROLE_LABEL[value]]);

export default async function StaffDetailPage({ params, searchParams }) {
  await requireOperator();
  const { id } = await params;
  const sp = await searchParams;

  let op;
  try {
    op = await operatorApi(`/admin/operators/${id}`);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-medium">{op.firstName} {op.lastName}</h1>
            <Badge variant={op.status === "active" ? "default" : "destructive"}>{op.status}</Badge>
          </div>
          <p className="text-muted-foreground text-xs">{op.email}</p>
        </div>
        <Button asChild variant="outline" size="sm"><Link href="/admin/staff">Back</Link></Button>
      </div>

      {sp?.error ? <p className="border-destructive/40 bg-destructive/5 text-destructive border px-4 py-2 text-sm" role="alert">{sp.error}</p> : null}
      {sp?.saved ? <p className="border-primary/30 bg-primary/5 text-pine border px-4 py-2 text-sm">Saved.</p> : null}
      {sp?.resetOk ? <p className="border-primary/30 bg-primary/5 text-pine border px-4 py-2 text-sm">Password reset.</p> : null}

      <Card className="rounded-none shadow-sm">
        <CardHeader><CardTitle className="text-lg">Account details</CardTitle></CardHeader>
        <CardContent>
          <form action={updateStaffAction} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="id" value={op.id} />
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" defaultValue={op.firstName} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" defaultValue={op.lastName} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={op.email} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                name="role"
                required
                defaultValue={op.role}
                className="border-input bg-card h-10 w-full rounded-none border px-3 text-sm"
              >
                {ROLES.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-none shadow-sm">
        <CardHeader><CardTitle className="text-lg">Reset password</CardTitle></CardHeader>
        <CardContent>
          <form action={resetStaffPasswordAction} className="flex flex-wrap items-end gap-4">
            <input type="hidden" name="id" value={op.id} />
            <div className="min-w-64 flex-1 space-y-2">
              <Label htmlFor="password">New temporary password</Label>
              <PasswordInput id="password" name="password" minLength={10} required />
              <p className="text-muted-foreground text-xs">At least 10 characters. The account is not notified — share it directly.</p>
            </div>
            <Button type="submit" variant="outline">Reset password</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-none shadow-sm">
        <CardHeader><CardTitle className="text-lg">Access</CardTitle></CardHeader>
        <CardContent>
          <form action={setStaffStatusAction} className="flex items-center gap-3">
            <input type="hidden" name="id" value={op.id} />
            <input type="hidden" name="action" value={op.status === "active" ? "suspend" : "activate"} />
            <p className="text-muted-foreground flex-1 text-sm">
              {op.status === "active" ? "This account can sign in." : "This account is suspended and cannot sign in."}
            </p>
            <Button type="submit" variant={op.status === "active" ? "destructive" : "default"}>
              {op.status === "active" ? "Suspend account" : "Activate account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
