"use client";

import { useState } from "react";
import { Download, FileText, File } from "lucide-react";
import { Button } from "../../ui/button";

export function ExportReportDialog({ isOpen, onClose, resource = "orders" }) {
  const [format, setFormat] = useState("csv");
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState("30d");

  async function handleExport() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        format,
        resource,
        dateRange,
      });

      const response = await fetch(`/api/admin/reports/export?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const filename = response.headers.get("x-filename") || `export.${format}`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export report");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-xl border border-border bg-card p-6 shadow-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-black text-foreground">Export Report</h2>

        <div className="mt-6 space-y-4">
          {/* Format Selection */}
          <div>
            <label className="text-sm font-bold text-foreground">Format</label>
            <div className="mt-2 space-y-2">
              {[
                { id: "csv", label: "CSV (Excel compatible)", icon: FileText },
                { id: "xlsx", label: "Excel (.xlsx)", icon: File },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setFormat(id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition ${
                    format === id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-bold">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-sm font-bold text-foreground">Date Range</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { id: "7d", label: "Last 7 days" },
                { id: "30d", label: "Last 30 days" },
                { id: "90d", label: "Last 90 days" },
                { id: "1y", label: "Last year" },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setDateRange(id)}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition ${
                    dateRange === id
                      ? "bg-primary text-primary-foreground"
                      : "border border-border hover:bg-secondary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={loading} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            {loading ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>
    </div>
  );
}
