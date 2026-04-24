"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setHasSession(!!data.user);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Stash</h1>
        <p className="text-muted text-sm mb-8">Set a new password</p>

        {hasSession === false ? (
          <div className="bg-card border border-border rounded-2xl p-5 text-sm">
            <p className="mb-3">
              Your reset link has expired or is invalid. Please request a new
              one.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="w-full px-4 py-2.5 rounded-xl bg-foreground text-card text-sm font-semibold"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm outline-none focus:border-muted transition"
            />
            {error && <p className="text-xs text-red-500 px-1">{error}</p>}
            <button
              type="submit"
              disabled={loading || hasSession === null}
              className="w-full px-4 py-3 rounded-xl bg-foreground text-card text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "Saving…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
