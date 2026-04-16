"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
}

export default function SettingsPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const router = useRouter();

  async function fetchKeys() {
    const res = await fetch("/api/keys");
    if (res.ok) {
      setKeys(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchKeys();
  }, []);

  async function createKey() {
    setCreating(true);
    const res = await fetch("/api/keys", { method: "POST" });
    if (res.ok) {
      await fetchKeys();
    }
    setCreating(false);
  }

  async function deleteKey(id: string) {
    setKeys((prev) => prev.filter((k) => k.id !== id));
    await fetch(`/api/keys/${id}`, { method: "DELETE" });
  }

  function copyKey(key: string) {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-5 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-subtle hover:text-foreground transition"
        >
          &larr; Back
        </button>
        <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
      </header>

      <div className="max-w-lg mx-auto p-6 space-y-8">
        {/* API Keys Section */}
        <section>
          <h2 className="text-base font-semibold tracking-tight mb-1">
            API Keys
          </h2>
          <p className="text-xs text-muted mb-4">
            Use an API key to save links from the iOS Shortcut or other
            external tools.
          </p>

          {loading ? (
            <p className="text-sm text-muted">Loading...</p>
          ) : (
            <>
              {keys.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-5 text-center">
                  <p className="text-sm text-muted mb-3">No API keys yet</p>
                  <button
                    onClick={createKey}
                    disabled={creating}
                    className="px-4 py-2.5 rounded-xl bg-foreground text-card text-sm font-semibold disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Generate API Key"}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {keys.map((k) => (
                    <div
                      key={k.id}
                      className="bg-card border border-border rounded-2xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{k.name}</span>
                        <button
                          onClick={() => deleteKey(k.id)}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          Revoke
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-background px-3 py-2 rounded-lg font-mono break-all">
                          {k.key}
                        </code>
                        <button
                          onClick={() => copyKey(k.key)}
                          className="px-3 py-2 rounded-lg bg-background text-xs font-medium shrink-0 hover:bg-border transition"
                        >
                          {copied === k.key ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={createKey}
                    disabled={creating}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm font-medium disabled:opacity-50 hover:bg-card transition"
                  >
                    {creating ? "Creating..." : "+ Generate Another Key"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* iOS Shortcut Instructions */}
        <section>
          <h2 className="text-base font-semibold tracking-tight mb-1">
            iOS Shortcut Setup
          </h2>
          <p className="text-xs text-muted mb-4">
            Create a Shortcut to save links from the iOS share sheet.
          </p>
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 text-sm">
            <div>
              <p className="font-medium mb-1">1. Open the Shortcuts app</p>
              <p className="text-xs text-muted">
                Tap + to create a new shortcut
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">
                2. Add &quot;Get URLs from Input&quot; action
              </p>
              <p className="text-xs text-muted">
                Set input to &quot;Shortcut Input&quot;
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">
                3. Add &quot;Get Contents of URL&quot; action
              </p>
              <p className="text-xs text-muted">Configure it as:</p>
              <ul className="text-xs text-muted mt-1 ml-4 list-disc space-y-1">
                <li>
                  URL:{" "}
                  <code className="bg-background px-1.5 py-0.5 rounded">
                    {appUrl}/api/save
                  </code>
                </li>
                <li>Method: <strong>POST</strong></li>
                <li>
                  Header:{" "}
                  <code className="bg-background px-1.5 py-0.5 rounded">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </li>
                <li>
                  Header:{" "}
                  <code className="bg-background px-1.5 py-0.5 rounded">
                    Content-Type: application/json
                  </code>
                </li>
                <li>
                  Request Body (JSON):{" "}
                  <code className="bg-background px-1.5 py-0.5 rounded">
                    {`{"url": "URLs from Input"}`}
                  </code>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">4. Enable Share Sheet</p>
              <p className="text-xs text-muted">
                Tap the shortcut name at top &rarr; tap (i) &rarr; enable
                &quot;Show in Share Sheet&quot; &rarr; select &quot;URLs&quot; as
                input type
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">5. Name it &quot;Save to Stash&quot;</p>
              <p className="text-xs text-muted">
                Now share any link from Safari, YouTube, or Spotify and tap
                &quot;Save to Stash&quot;
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
