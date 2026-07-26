/**
 * Minimal, dependency-free CSV read/write for the admin bulk tools.
 *
 * Handles the RFC-4180 essentials: comma delimiters, CRLF or LF rows, and
 * double-quoted fields (with "" escaping) so values may contain commas,
 * quotes, and newlines. Good enough for catalogue import/export; swap for a
 * streaming parser if files ever grow beyond a few thousand rows.
 */

/** Serialise records to a CSV string. `columns` = [{ key, header }]. */
export function toCsv(records, columns) {
  const esc = (value) => {
    const s = value == null ? "" : String(value);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = columns.map((c) => esc(c.header)).join(",");
  const body = records.map((rec) => columns.map((c) => esc(rec[c.key])).join(",")).join("\r\n");
  return `${head}\r\n${body}`;
}

/**
 * Parse a CSV string into an array of row objects keyed by the header row.
 * Returns { headers, rows }.
 */
export function parseCsv(text) {
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;
  const src = text.replace(/^﻿/, ""); // strip BOM

  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i += 1; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field); field = "";
    } else if (ch === "\n") {
      row.push(field); rows.push(row); field = ""; row = [];
    } else if (ch === "\r") {
      // swallow — handled by the following \n (or end of input)
    } else {
      field += ch;
    }
  }
  // Flush the trailing field/row if the file didn't end with a newline.
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }

  const nonEmpty = rows.filter((r) => r.some((c) => c.trim() !== ""));
  if (nonEmpty.length === 0) return { headers: [], rows: [] };

  const headers = nonEmpty[0].map((h) => h.trim());
  const dataRows = nonEmpty.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (r[idx] ?? "").trim(); });
    return obj;
  });
  return { headers, rows: dataRows };
}
