"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (!error) setSent(true);
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Stash</h1>
        <p className="text-muted text-sm mb-8">
          Save links to articles, videos, and podcasts.
        </p>

        {sent ? (
          <div className="bg-card rounded-2xl border border-border p-6 text-center">
            <p className="text-sm font-medium mb-1">Check your email</p>
            <p className="text-xs text-muted">
              We sent a magic link to <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm outline-none focus:border-muted transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-foreground text-card text-sm font-semibold disabled:opacity-50 transition"
            >
              {loading ? "Sending..." : "Continue with Email"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
