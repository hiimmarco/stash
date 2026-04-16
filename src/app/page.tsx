"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Link, LinkType } from "@/lib/types";
import { LinkCard } from "@/components/link-card";
import { SaveModal } from "@/components/save-modal";
import { Sidebar } from "@/components/sidebar";
import { useRouter } from "next/navigation";

type Filter = "all" | LinkType;

export default function HomePage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [saveOpen, setSaveOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchLinks = useCallback(async () => {
    const res = await fetch("/api/links");
    if (res.ok) {
      const data = await res.json();
      setLinks(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  async function handleDelete(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    await fetch(`/api/links/${id}`, { method: "DELETE" });
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const filtered =
    filter === "all" ? links : links.filter((l) => l.type === filter);

  return (
    <div className="flex flex-1 h-screen">
      <Sidebar filter={filter} onFilterChange={setFilter} onLogout={handleLogout} />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="bg-card border-b border-border px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:hidden">
            <h1 className="text-xl font-semibold tracking-tight">Stash</h1>
            <button
              onClick={() => router.push("/settings")}
              className="text-base opacity-60 hover:opacity-100 transition"
            >
              {"\u2699\uFE0F"}
            </button>
          </div>
          <h2 className="text-xl font-semibold tracking-tight hidden md:block">
            {filter === "all"
              ? "All Links"
              : filter === "article"
              ? "Articles"
              : filter === "video"
              ? "Videos"
              : "Podcasts"}
          </h2>
          <button
            onClick={() => setSaveOpen(true)}
            className="px-4 py-2 rounded-xl bg-foreground text-card text-sm font-semibold transition hover:opacity-90"
          >
            + Save Link
          </button>
        </header>

        {/* Mobile filter tabs */}
        <div className="flex gap-2 px-5 py-3 bg-card border-b border-border md:hidden overflow-x-auto">
          {(["all", "article", "video", "podcast"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                filter === f
                  ? "bg-foreground text-card"
                  : "bg-background text-subtle"
              }`}
            >
              {f === "all"
                ? "All"
                : f === "article"
                ? "Articles"
                : f === "video"
                ? "Videos"
                : "Podcasts"}
            </button>
          ))}
        </div>

        {/* Link list */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {loading ? (
            <div className="text-center py-20 text-muted text-sm">
              Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">{"\uD83D\uDD17"}</p>
              <p className="text-sm font-medium text-foreground">
                No links yet
              </p>
              <p className="text-xs text-muted mt-1">
                Save your first link to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-w-2xl mx-auto">
              {filtered.map((link) => (
                <LinkCard key={link.id} link={link} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </main>

      <SaveModal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        onSaved={fetchLinks}
      />
    </div>
  );
}
