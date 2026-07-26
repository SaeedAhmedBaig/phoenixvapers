"use server";

/**
 * Bulk catalogue import (spec Phase 1 admin). Each CSV row becomes a DRAFT
 * product via the same role-gated create endpoint a single product uses —
 * so every compliance and validation rule still applies per row, and a bad
 * row fails in isolation without aborting the batch. Returns a per-row
 * report for `useActionState`.
 */

import { revalidatePath } from "next/cache";

import { operatorApi } from "@/lib/admin";
import { parseCsv } from "@/lib/csv";
import { rowToCreateBody } from "@/lib/product-csv";

/** Safety cap — keeps a single upload bounded. */
const MAX_ROWS = 500;

export async function importProductsAction(_prevState, formData) {
  const file = formData.get("file");
  if (!file || typeof file.text !== "function" || file.size === 0) {
    return { ok: false, message: "Choose a CSV file to import." };
  }

  let rows;
  try {
    const text = await file.text();
    rows = parseCsv(text).rows;
  } catch {
    return { ok: false, message: "That file could not be read as CSV." };
  }

  if (rows.length === 0) return { ok: false, message: "No data rows found in the file." };
  if (rows.length > MAX_ROWS) {
    return { ok: false, message: `Too many rows (${rows.length}). Split into files of ${MAX_ROWS} or fewer.` };
  }

  let created = 0;
  const errors = [];
  for (let i = 0; i < rows.length; i += 1) {
    try {
      await operatorApi("/admin/products", { method: "POST", body: rowToCreateBody(rows[i]) });
      created += 1;
    } catch (error) {
      // +2: 1-based, and row 1 is the header in the source file.
      errors.push({ row: i + 2, message: error.message ?? "failed" });
    }
  }

  revalidatePath("/admin/products");
  return {
    ok: true,
    total: rows.length,
    created,
    failed: errors.length,
    errors: errors.slice(0, 20), // show the first 20; count covers the rest
  };
}
