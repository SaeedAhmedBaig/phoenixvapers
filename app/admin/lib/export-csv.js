/**
 * Client-side CSV export. `columns` maps header label -> row accessor
 * (string key or function). Triggers a browser download immediately.
 */
export function exportToCsv(filename, rows, columns) {
  if (!rows || rows.length === 0) return false;

  const headers = Object.keys(columns);
  const escape = (value) => {
    const str = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const accessor = columns[header];
          const value = typeof accessor === "function" ? accessor(row) : row[accessor];
          return escape(value);
        })
        .join(","),
    ),
  ];

  // ﻿ BOM so Excel opens UTF-8 (£ signs) correctly
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

export const formatMoney = (minor) => `£${((minor || 0) / 100).toFixed(2)}`;
