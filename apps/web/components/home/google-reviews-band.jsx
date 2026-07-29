import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";

/** The four-colour Google "G" mark — standard usage for a "reviews on
 *  Google" / "sign in with Google" style badge, not a fabricated logo. */
function GoogleG({ className }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.5 30.5 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.1 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.6c-.5 3-2.2 5.4-4.6 7.1l7.2 5.6c4.2-3.9 6.7-9.6 6.7-17.2z" />
      <path fill="#FBBC05" d="M10.5 19.3c-.5 1.5-.8 3-.8 4.7s.3 3.2.8 4.7l-7.9 6.1C1 31.6 0 27.9 0 24s1-7.6 2.6-10.8l7.9 6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.2-5.6c-2 1.4-4.6 2.2-8.7 2.2-6.3 0-11.6-3.6-13.5-8.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

/**
 * A trust-badge CTA to the business's real Google reviews — deliberately
 * doesn't print a specific star rating or review count here, since that's
 * a live number owned by Google, not something to freeze into page source
 * (and risk going stale/inaccurate). Links out to a genuine Google Maps
 * search for the real business rather than quoting an unverifiable figure.
 */
export function GoogleReviewsBand() {
  return (
    <section className="border-border bg-card border-y">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <GoogleG className="size-9 shrink-0" />
          <div>
            <p className="font-medium">Rated by real customers on Google</p>
            <p className="text-muted-foreground text-sm">Genuine reviews from people who&apos;ve actually shopped with us.</p>
          </div>
        </div>
        <Button asChild variant="outline">
          <a
            href="https://www.google.com/maps/search/?api=1&query=Phoenix+Vapers+Peterborough"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our Google reviews <ExternalLink className="size-4" />
          </a>
        </Button>
      </div>
    </section>
  );
}
