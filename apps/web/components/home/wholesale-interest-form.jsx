"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const WHOLESALE_EMAIL = "support@phoenixvapers.co.uk";

/**
 * Trade-account interest form. There's no leads backend yet (the trade
 * portal itself isn't live — spec Phase 8), so this doesn't invent one;
 * it structures what the visitor already typed into a pre-filled email to
 * the wholesale inbox, which is a genuine improvement over a bare "email
 * us" link without pretending a self-service pipeline exists that doesn't.
 */
export function WholesaleInterestForm() {
  const [values, setValues] = useState({
    business: "",
    contact: "",
    email: "",
    phone: "",
    volume: "",
    message: "",
  });

  function set(field) {
    return (e) => setValues((v) => ({ ...v, [field]: e.target.value }));
  }

  function submit(e) {
    e.preventDefault();
    const subject = `Trade account interest — ${values.business || "New enquiry"}`;
    const bodyLines = [
      `Business name: ${values.business}`,
      `Contact name: ${values.contact}`,
      `Email: ${values.email}`,
      `Phone: ${values.phone}`,
      `Estimated monthly volume: ${values.volume}`,
      "",
      values.message,
    ];
    const mailto = `mailto:${WHOLESALE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
    window.location.href = mailto;
  }

  return (
    <form onSubmit={submit} className="phx-card grid gap-4 p-6 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="business">Business name</Label>
        <Input id="business" required value={values.business} onChange={set("business")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact">Your name</Label>
        <Input id="contact" required value={values.contact} onChange={set("contact")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required value={values.email} onChange={set("email")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" type="tel" value={values.phone} onChange={set("phone")} />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="volume">Estimated monthly volume</Label>
        <Input id="volume" placeholder="e.g. 50–100 units/month" value={values.volume} onChange={set("volume")} />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="message">Anything else we should know?</Label>
        <textarea
          id="message"
          rows={3}
          value={values.message}
          onChange={set("message")}
          className="border-input bg-card w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" size="lg">Send interest</Button>
        <p className="text-muted-foreground mt-2 text-xs">
          Opens your email client with these details ready to send to our wholesale team.
        </p>
      </div>
    </form>
  );
}
