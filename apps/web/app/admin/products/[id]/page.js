import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPence } from "@phoenix/utils/money";

import {
  approveProductAction,
  deleteDraftAction,
  publishProductAction,
  rejectProductAction,
  retireProductAction,
  setComplianceProfileAction,
  submitForReviewAction,
  updateProductMediaAction,
} from "../actions";
import { LifecycleStepper } from "@/components/admin/lifecycle-stepper";
import { ProductImageUploader } from "@/components/admin/product-image-uploader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { operatorApi, requireOperator } from "@/lib/admin";

const PRODUCT_TYPES = ["e-liquid", "nic-salt", "shortfill", "hardware", "coil", "accessory", "cbd-liquid"];

export default async function AdminProductDetail({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const operator = await requireOperator();

  let product;
  try {
    product = await operatorApi(`/admin/products/${id}`);
  } catch {
    notFound();
  }

  const isMerch = operator.role === "merchandiser";
  const isOfficer = operator.role === "compliance_officer";
  const profile = product.complianceProfile ?? null;
  const price = product.variants?.find((v) => v.netPriceMinor != null)?.netPriceMinor;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-medium">{product.name}</h1>
            <Badge>{product.status}</Badge>
          </div>
          <p className="text-muted-foreground font-mono text-xs">{product.slug}</p>
        </div>
        <Button asChild variant="outline" size="sm"><Link href="/admin/products">Back</Link></Button>
      </div>

      {sp?.error ? <p className="border-destructive/40 bg-destructive/5 text-destructive border px-4 py-2 text-sm" role="alert">{sp.error}</p> : null}
      {sp?.saved ? <p className="border-primary/30 bg-primary/5 text-pine border px-4 py-2 text-sm">Saved.</p> : null}

      <Card className="rounded-none shadow-sm">
        <CardHeader><CardTitle className="text-base">Overview</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <Row label="Brand" value={product.brand} />
            <Row label="Category" value={product.category} />
            <Row label="Net price" value={price != null ? formatPence(price) : "—"} />
            <Row label="Compliance" value={profile?.locked ? "Approved & locked" : profile ? "Set (not approved)" : "Not set"} />
          </dl>
          <p className="text-muted-foreground mt-4 text-sm">{product.description}</p>
        </CardContent>
      </Card>

      {/* Shared lifecycle view — visible to EVERY operator who can open this
          page, unlike the role-gated cards below. Fixes the console's core
          confusion: previously a merchandiser and a compliance officer each
          only saw their own half of the process, with no "what's next /
          whose turn" signal either could see. */}
      <Card className="rounded-none shadow-sm">
        <CardHeader><CardTitle className="text-base">Lifecycle status</CardTitle></CardHeader>
        <CardContent>
          <LifecycleStepper
            status={product.status}
            complianceLocked={!!profile?.locked}
            operatorRole={operator.role}
            roleDetailHref={`/admin/roles/${operator.role}`}
          />
        </CardContent>
      </Card>

      {/* Media — editable while draft (merchandiser); read-only otherwise,
          since updateDraft() only ever succeeds on a draft product (§16.7). */}
      <Card className="rounded-none shadow-sm">
        <CardHeader><CardTitle className="text-base">Images</CardTitle></CardHeader>
        <CardContent>
          {isMerch && product.status === "draft" ? (
            <form action={updateProductMediaAction} className="space-y-4">
              <input type="hidden" name="id" value={id} />
              <ProductImageUploader initialImages={product.media ?? []} />
              <Button type="submit" size="sm">Save images</Button>
            </form>
          ) : product.media?.length ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {product.media.map((m) => (
                // eslint-disable-next-line @next/next/no-img-element
                <li key={m.url}><img src={m.url} alt={m.alt} className="bg-muted aspect-square w-full object-cover" /></li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">No images yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Merchandiser lifecycle */}
      {isMerch ? (
        <Card className="rounded-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Lifecycle</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {product.status === "draft" ? (
              <>
                <Form action={submitForReviewAction} id={id}><Button type="submit" size="sm">Submit for review</Button></Form>
                <Form action={deleteDraftAction} id={id}><Button type="submit" size="sm" variant="destructive">Delete draft</Button></Form>
              </>
            ) : null}
            {product.status === "review" ? (
              <Form action={publishProductAction} id={id}><Button type="submit" size="sm">Publish</Button></Form>
            ) : null}
            {product.status === "sellable" ? (
              <Form action={retireProductAction} id={id}><Button type="submit" size="sm" variant="outline">Retire</Button></Form>
            ) : null}
            {product.status === "review" ? (
              <p className="text-muted-foreground w-full text-xs">Publishing requires an approved, locked compliance profile (set by a compliance officer).</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {/* Compliance officer: profile + approve/reject */}
      {isOfficer ? (
        <Card className="rounded-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Compliance profile</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <form action={setComplianceProfileAction} className="grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" value={id} />
              <div className="space-y-2">
                <Label htmlFor="productType">Product type</Label>
                <select id="productType" name="productType" defaultValue={profile?.productType ?? "hardware"} className="border-input bg-card h-10 w-full rounded-none border px-3 text-sm">
                  {PRODUCT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dutyClassification">Duty classification</Label>
                <select id="dutyClassification" name="dutyClassification" defaultValue={profile?.dutyClassification ?? "non-liquid"} className="border-input bg-card h-10 w-full rounded-none border px-3 text-sm">
                  <option value="vaping-liquid">vaping-liquid</option>
                  <option value="non-liquid">non-liquid</option>
                </select>
              </div>
              <div className="space-y-2"><Label htmlFor="nicotineStrengthMgPerMl">Nicotine mg/ml (liquids)</Label><Input id="nicotineStrengthMgPerMl" name="nicotineStrengthMgPerMl" type="number" min="0" max="20" defaultValue={profile?.nicotineStrengthMgPerMl ?? ""} /></div>
              <div className="space-y-2"><Label htmlFor="containerVolumeMl">Container ml (liquids)</Label><Input id="containerVolumeMl" name="containerVolumeMl" type="number" min="0" defaultValue={profile?.containerVolumeMl ?? ""} /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="notificationNumber">MHRA notification (nicotine)</Label><Input id="notificationNumber" name="notificationNumber" defaultValue={profile?.notificationNumber ?? ""} /></div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="mandatedWarnings">Mandated warnings (one per line)</Label>
                <textarea id="mandatedWarnings" name="mandatedWarnings" rows={2} defaultValue={(profile?.mandatedWarnings ?? []).join("\n")} className="border-input bg-card w-full rounded-none border px-3 py-2 text-sm" />
              </div>
              <div className="sm:col-span-2"><Button type="submit" size="sm">Save profile</Button></div>
            </form>

            {product.status === "review" ? (
              <div className="border-border flex flex-wrap gap-2 border-t pt-4">
                <Form action={approveProductAction} id={id}><Button type="submit" size="sm">Approve &amp; lock</Button></Form>
                <form action={rejectProductAction} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={id} />
                  <Input name="reason" placeholder="Rejection reason" className="h-9 w-48" />
                  <Button type="submit" size="sm" variant="destructive">Reject</Button>
                </form>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium capitalize">{value}</dd>
    </div>
  );
}

/** Tiny helper: a form carrying the product id for a one-button action. */
function Form({ action, id, children }) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      {children}
    </form>
  );
}
