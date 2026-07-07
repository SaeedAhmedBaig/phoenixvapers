"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Gift, Loader2, PackageCheck, Sparkles, Zap } from "lucide-react";
import { useUser } from "../../lib/user-store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

function PasswordInput({ id, value, onChange, disabled, autoComplete, minLength }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        required
        minLength={minLength}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete={autoComplete}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div
      className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm font-bold text-destructive"
      role="alert"
    >
      {message}
    </div>
  );
}

export function LoginDialog({ open, onOpenChange, onSwitchToSignup }) {
  const { login } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      await login(email, password);
      onOpenChange(false);
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.body?.message || "Login failed. Please check your email and password.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-1 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <DialogTitle className="text-2xl">Welcome back</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to track orders, earn loyalty points, and check out faster.
          </p>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <PasswordInput
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pending}
              autoComplete="current-password"
            />
          </div>

          <ErrorBanner message={error} />

          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? "Signing in…" : "Sign In"}
          </Button>

          <p className="text-center text-sm font-bold text-muted-foreground">
            New to Phoenix Vapers?{" "}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="font-black text-primary transition hover:opacity-80"
            >
              Create an account
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const SIGNUP_BENEFITS = [
  { icon: Gift, label: "Earn loyalty points on every order" },
  { icon: PackageCheck, label: "Track deliveries in real time" },
  { icon: Zap, label: "Faster checkout with saved details" },
];

export function SignupDialog({ open, onOpenChange, onSwitchToLogin }) {
  const { register } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      await register(email, password, name, phone);
      onOpenChange(false);
      setEmail("");
      setPassword("");
      setName("");
      setPhone("");
    } catch (err) {
      setError(err.body?.message || "Registration failed. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-1 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Gift className="h-5 w-5 text-primary" />
          </div>
          <DialogTitle className="text-2xl">Join Phoenix Vapers</DialogTitle>
          <p className="text-sm text-muted-foreground">Free to join. Instant rewards.</p>
        </DialogHeader>

        {/* Membership benefits */}
        <ul className="space-y-2 rounded-xl bg-secondary/50 p-4">
          {SIGNUP_BENEFITS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2.5 text-sm font-bold text-foreground">
              <Icon className="h-4 w-4 flex-shrink-0 text-primary" />
              {label}
            </li>
          ))}
        </ul>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="signup-name">Full Name</Label>
            <Input
              id="signup-name"
              type="text"
              required
              autoComplete="name"
              placeholder="Alex Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <PasswordInput
              id="signup-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pending}
              autoComplete="new-password"
              minLength={8}
            />
            <p className="text-xs text-muted-foreground">At least 8 characters</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-phone">
              Phone <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="signup-phone"
              type="tel"
              autoComplete="tel"
              placeholder="For delivery updates"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={pending}
            />
          </div>

          <ErrorBanner message={error} />

          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? "Creating account…" : "Create Account"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            You must be 18 or over. By joining you agree to our{" "}
            <Link href="/terms" className="font-bold text-foreground underline-offset-2 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-bold text-foreground underline-offset-2 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>

          <p className="text-center text-sm font-bold text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-black text-primary transition hover:opacity-80"
            >
              Sign in
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
