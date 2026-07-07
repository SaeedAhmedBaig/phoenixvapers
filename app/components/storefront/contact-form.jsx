"use client";

import { useState } from "react";
import { BadgeCheck, Loader2 } from "lucide-react";
import { Input, Textarea } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  function submit(e) {
    e.preventDefault();
    setPending(true);
    setTimeout(() => {
      setPending(false);
      setSent(true);
    }, 700);
  }

  if (sent) {
    return (
      <div className="grid content-center gap-3 rounded-3xl bg-secondary p-8 text-center">
        <BadgeCheck className="mx-auto h-12 w-12 text-primary" />
        <strong className="text-xl font-black text-foreground">Message sent</strong>
        <p className="text-sm font-bold text-muted-foreground">
          Our support team replies during weekday business hours (8am–4pm).
        </p>
      </div>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      {[
        ["Name", "name", "text"],
        ["Email address", "email", "email"],
        ["Order number", "order", "text"],
      ].map(([label, id, type]) => (
        <div key={id} className="grid gap-1.5">
          <Label htmlFor={id}>{label}</Label>
          <Input id={id} type={type} required={id !== "order"} />
        </div>
      ))}
      <div className="grid gap-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending…
          </>
        ) : (
          "Send message"
        )}
      </Button>
    </form>
  );
}
