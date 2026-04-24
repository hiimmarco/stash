"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Mode = "signin" | "signup" | "reset";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/");
      router.refresh();
      return;
    }

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      // If email confirmation is disabled, a session is returned immediately.
      if (data.session) {
        router.push("/");
        router.refresh();
        return;
      }
      setInfo("Check your email to confirm your account.");
      return;
    }

    // reset
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setInfo("Check your email for a password reset link.");
  }

  const title =
    mode === "signin"
      ? "Sign in"
      : mode === "signup"
      ? "Create account"
      : "Reset password";

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Stash</h1>
        <p className="text-muted text-sm mb-8">{title}</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm outline-none focus:border-muted transition"
          />
          {mode !== "reset" && (
            <input
              type="password"
              required
              minLength={6}
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm outline-none focus:border-muted transition"
            />
          )}

          {error && (
            <p className="text-xs text-red-500 px-1">{error}</p>
          )}
          {info && (
            <p className="text-xs text-muted px-1">{info}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl bg-foreground text-card text-sm font-semibold disabled:opacity-50 transition"
          >
            {loading
              ? "Working…"
              : mode === "signin"
              ? "Sign in"
              : mode === "signup"
              ? "Create account"
              : "Send reset link"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-xs text-muted text-center">
          {mode === "signin" && (
            <>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                  setInfo(null);
                }}
                className="hover:text-foreground transition"
              >
                Don&apos;t have an account? Create one
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("reset");
                  setError(null);
                  setInfo(null);
                }}
                className="hover:text-foreground transition"
              >
                Forgot password?
              </button>
            </>
          )}
          {mode !== "signin" && (
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
                setInfo(null);
              }}
              className="hover:text-foreground transition"
            >
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
