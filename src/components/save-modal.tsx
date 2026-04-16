"use client";

import { useState } from "react";

interface SaveModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function SaveModal({ open, onClose, onSaved }: SaveModalProps) {
  const [url, setUrl] = useState("");
  const [meta, setMeta] = useState<{
    title: string;
    description: string;
    thumbnail_url: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function fetchMeta() {
    if (!url.trim()) return;
    setLoading(true);
    setMeta(null);
    try {
      const res = await fetch("/api/links/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      setMeta(data);
    } catch {
      setMeta({ title: "", description: "", thumbnail_url: "" });
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          title: meta?.title || url.trim(),
          description: meta?.description || null,
          thumbnail_url: meta?.thumbnail_url || null,
        }),
      });
      setUrl("");
      setMeta(null);
      onSaved();
      onClose();
    } catch {
      // ignore
    }
    setSaving(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card rounded-t-2xl md:rounded-2xl p-6 md:mx-4">
        <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5 md:hidden" />
        <h2 className="text-lg font-semibold tracking-tight mb-4">Save Link</h2>

        <div className="flex gap-2 mb-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a URL..."
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-muted transition"
            onKeyDown={(e) => e.key === "Enter" && fetchMeta()}
          />
          <button
            onClick={fetchMeta}
            disabled={loading || !url.trim()}
            className="px-4 py-3 rounded-xl border border-border text-sm font-medium disabled:opacity-40 transition hover:bg-background"
          >
            {loading ? "..." : "Fetch"}
          </button>
        </div>

        {meta && (
          <div className="bg-background rounded-xl p-4 mb-4">
            <p className="text-xs text-muted mb-1">Auto-detected</p>
            <p className="text-sm font-semibold leading-snug">
              {meta.title || "No title found"}
            </p>
            {meta.description && (
              <p className="text-xs text-subtle mt-1 line-clamp-2">
                {meta.description}
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !url.trim()}
          className="w-full px-4 py-3.5 rounded-xl bg-foreground text-card text-sm font-semibold disabled:opacity-50 transition"
        >
          {saving ? "Saving..." : "Save to Stash"}
        </button>
      </div>
    </div>
  );
}
