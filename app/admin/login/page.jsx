"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flame, Loader2, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "../lib/admin-auth";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      await login(email, password);
      router.replace("/admin");
    } catch (err) {
      setError(err?.body?.message || err.message || "Login failed. Check your credentials.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-xl">
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Flame className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <div>
            <strong className="block text-base font-black text-foreground">Phoenix Vapers</strong>
            <small className="block text-xs font-bold text-muted-foreground">Staff control plane</small>
          </div>
        </div>

        <h1 className="mt-6 text-xl font-black tracking-tight text-foreground">Sign in to continue</h1>
        <p className="mt-1 text-sm text-muted-foreground">Staff, brand-partner, and super-admin accounts only.</p>

        <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error ? <p className="text-sm font-bold text-destructive">{error}</p> : null}

          <Button type="submit" disabled={pending} className="mt-1">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </main>
  );
}
