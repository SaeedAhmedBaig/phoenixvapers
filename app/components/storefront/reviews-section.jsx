import { MessageSquareText, Star } from "lucide-react";
import { SectionHeader } from "./section-header";

export function ReviewsSection({ initialReviews, ratingAvg, ratingCount }) {
  const items = initialReviews?.items ?? [];

  return (
    <div>
      <SectionHeader
        eyebrow="Customer reviews"
        title={ratingCount > 0 ? `${ratingAvg.toFixed(1)} average from ${ratingCount} reviews` : "No reviews yet"}
        text={ratingCount > 0 ? "Verified feedback from customers who bought this product." : "Be the first to review this product after your order arrives."}
      />

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <MessageSquareText className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-bold text-muted-foreground">
            No reviews have been submitted for this product yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((review) => (
            <article key={review._id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? "fill-warning text-warning" : "fill-none text-border"}`}
                    />
                  ))}
                </div>
                {review.verifiedPurchase ? (
                  <span className="text-xs font-black uppercase tracking-wide text-primary">Verified purchase</span>
                ) : null}
              </div>
              <h3 className="mt-3 text-base font-black text-foreground">{review.title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{review.body}</p>
              <p className="mt-3 text-xs font-bold text-muted-foreground">{review.authorName}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
