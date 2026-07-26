"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Upload } from "lucide-react";

import { importProductsAction } from "@/app/admin/products/import/actions";
import { Button } from "@/components/ui/button";

export function ProductImportForm() {
  const [state, formAction, pending] = useActionState(importProductsAction, null);

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-4">
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          className="border-input bg-card w-full rounded-none border px-3 py-2 text-sm file:mr-3 file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm"
        />
        <Button type="submit" disabled={pending}>
          {pending ? <><Loader2 className="size-4 animate-spin" /> Importing…</> : <><Upload className="size-4" /> Import products</>}
        </Button>
      </form>

      {state && state.ok === false ? (
        <p className="border-destructive/40 bg-destructive/5 text-destructive border px-4 py-2 text-sm" role="alert">{state.message}</p>
      ) : null}

      {state?.ok ? (
        <div className="border-border bg-card border p-4">
          <p className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="text-pine size-4" />
            {state.created} of {state.total} imported as drafts{state.failed ? ` · ${state.failed} failed` : ""}.
          </p>
          {state.errors?.length ? (
            <ul className="text-muted-foreground mt-3 space-y-1 text-xs">
              {state.errors.map((e, i) => (
                <li key={i}><span className="font-mono">Row {e.row}</span>: {e.message}</li>
              ))}
              {state.failed > state.errors.length ? <li>…and {state.failed - state.errors.length} more.</li> : null}
            </ul>
          ) : null}
          <Link href="/admin/products?status=draft" className="text-pine mt-3 inline-block text-sm font-medium hover:underline">
            Review imported drafts →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
