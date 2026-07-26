import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * A deliberate, honest "not yet built" console section — a clean roadmap
 * card rather than a broken-looking stub. Used for roles whose tooling
 * lands in a later phase (Fulfilment → Phase 4, Marketing → Phase 8).
 */
export function ConsolePlaceholder({ eyebrow, title, intro, phase, features }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-pine text-xs font-semibold tracking-widest uppercase">{eyebrow}</p>
        <h1 className="font-display mt-1 text-2xl font-medium sm:text-3xl">{title}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">{intro}</p>
      </div>

      <Card className="rounded-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Arriving in {phase}</CardTitle>
          <CardDescription>Your access is set up now; these tools switch on as the module lands.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f} className="border-border bg-muted/40 flex items-start gap-2 border p-3 text-sm">
                <span className="bg-primary/60 mt-1.5 size-1.5 shrink-0 rounded-full" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
