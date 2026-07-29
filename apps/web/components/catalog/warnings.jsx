export function WarningsBlock({ warnings = [] }) {
  if (!warnings.length) return null;
  return (
    <aside className="border-warning/30 bg-warning/5 rounded-lg border p-4 text-sm" role="note">
      <p className="font-semibold">Important information</p>
      <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-4">
        {warnings.map((w) => <li key={w}>{w}</li>)}
      </ul>
    </aside>
  );
}

/** Graceful fallback when the catalogue service is temporarily unreachable. */
export function ApiDownNotice({ className = "" }) {
  return (
    <div className={`border-warning/30 bg-warning/5 rounded-lg border px-4 py-3 text-sm ${className}`} role="status">
      <p className="font-medium">Catalogue temporarily unavailable</p>
      <p className="text-muted-foreground mt-1 text-xs">We&apos;re having trouble loading products right now — please refresh in a moment.</p>
    </div>
  );
}
