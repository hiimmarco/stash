"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Link, LinkType } from "@/lib/types";
import { LinkCard } from "@/components/link-card";
import { SaveModal } from "@/components/save-modal";
import { Sidebar, type Filter } from "@/components/sidebar";
import { useRouter } from "next/navigation";

const filterLabels: Record<Filter, string> = {
  all: "All Links",
  article: "Articles",
  video: "Videos",
  podcast: "Podcasts",
  archived: "Archive",
};

const mobileFilters: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "article", label: "Articles" },
  { key: "video", label: "Videos" },
  { key: "podcast", label: "Podcasts" },
  { key: "archived", label: "Archive" },
];

export default function HomePage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [saveOpen, setSaveOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchLinks = useCallback(async (f: Filter = filter) => {
    setLoading(true);
    const archived = f === "archived";
    const res = await fetch(`/api/links?archived=${archived}`);
    if (res.ok) {
      const data: Link[] = await res.json();
      // For non-archive views, also filter by type on the client
      const typed = archived || f === "all"
        ? data
        : data.filter((l) => l.type === (f as LinkType));
      setLinks(typed);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchLinks(filter);
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDelete(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    await fetch(`/api/links/${id}`, { method: "DELETE" });
  }

  async function handleArchive(id: string, archive: boolean) {
    // Optimistically remove from current view
    setLinks((prev) => prev.filter((l) => l.id !== id));
    await fetch(`/api/links/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_archived: archive }),
    });
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="flex flex-1 h-screen">
      <Sidebar filter={filter} onFilterChange={setFilter} onLogout={handleLogout} />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
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
            {filterLabels[filter]}
          </h2>
          {filter !== "archived" && (
            <button
              onClick={() => setSaveOpen(true)}
              className="px-4 py-2 rounded-xl bg-foreground text-card text-sm font-semibold transition hover:opacity-90"
            >
              + Save Link
            </button>
          )}
        </header>

        {/* Mobile filter tabs */}
        <div className="flex gap-2 px-5 py-3 bg-card border-b border-border md:hidden overflow-x-auto">
          {mobileFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                filter === f.key
                  ? "bg-foreground text-card"
                  : "bg-background text-subtle"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Link list */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {loading ? (
            <div className="text-center py-20 text-muted text-sm">Loading...</div>
          ) : links.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">
                {filter === "archived" ? "\uD83D\uDDC4\uFE0F" : "\uD83D\uDD17"}
              </p>
              <p className="text-sm font-medium text-foreground">
                {filter === "archived" ? "No archived links" : "No links yet"}
              </p>
              <p className="text-xs text-muted mt-1">
                {filter === "archived"
                  ? "Swipe left or hover over a card to archive"
                  : "Save your first link to get started"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-w-2xl mx-auto">
              {links.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onDelete={handleDelete}
                  onArchive={handleArchive}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <SaveModal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        onSaved={() => fetchLinks(filter)}
      />
    </div>
  );
}
