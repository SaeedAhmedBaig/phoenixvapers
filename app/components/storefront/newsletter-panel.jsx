"use client";

import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function NewsletterPanel() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="mx-auto mt-16 max-w-7xl px-4">
      <div className="grid gap-8 rounded-xl border border-border bg-card p-6 shadow-xl lg:grid-cols-[1fr_0.9fr] lg:p-10">
        <div>
          <Badge>Retention</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground md:text-4xl">
            New drops, bundle pricing, and loyalty campaigns.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Get launch messaging, repeat-purchase offers, and members-only bundle pricing — with
            compliant consent and easy unsubscribe.
          </p>
        </div>

        {done ? (
          <div className="grid content-center gap-3 rounded-3xl bg-secondary p-6 text-center">
            <BadgeCheck className="mx-auto h-10 w-10 text-primary" />
            <strong className="text-lg font-black text-foreground">You're subscribed</strong>
            <p className="text-sm font-bold text-muted-foreground">Watch your inbox for new drops and offers.</p>
          </div>
        ) : (
          <form
            className="grid content-center gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (email.includes("@")) setDone(true);
            }}
          >
            <label className="text-sm font-black text-foreground" htmlFor="newsletter-email">
              Email address
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 rounded-full"
              />
              <Button type="submit">Subscribe</Button>
            </div>
            <p className="text-xs leading-6 text-muted-foreground">
              By subscribing, you agree to receive Phoenix Vapers marketing and can unsubscribe at any time.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
