"use client";

import { useState, useRef } from "react";
import type { Link } from "@/lib/types";

const typeIcons: Record<string, string> = {
  video: "\u25B6\uFE0F",
  podcast: "\uD83C\uDFA7",
  article: "\uD83D\uDCC4",
};

const platformIcons: Record<string, string> = {
  YouTube: "\u25B6",
  Spotify: "\uD83C\uDFB5",
  "Apple Podcasts": "\uD83C\uDF99\uFE0F",
  Vimeo: "\u25B6",
  Twitch: "\u25B6",
};

export function LinkCard({
  link,
  onDelete,
}: {
  link: Link;
  onDelete: (id: string) => void;
}) {
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const dragging = useRef(false);

  function handleTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
    dragging.current = true;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!dragging.current) return;
    const diff = startX.current - e.touches[0].clientX;
    if (diff > 0) setOffset(Math.min(diff, 80));
    else setOffset(0);
  }

  function handleTouchEnd() {
    dragging.current = false;
    if (offset > 60) {
      onDelete(link.id);
    }
    setOffset(0);
  }

  const icon = typeIcons[link.type] || "\uD83D\uDCC4";
  const platformIcon = platformIcons[link.platform] || "\uD83C\uDF10";

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Delete zone behind card */}
      <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-5 rounded-2xl">
        <span className="text-white text-xs font-semibold">Delete</span>
      </div>

      {/* Card */}
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex bg-card border border-border rounded-2xl overflow-hidden transition-transform"
        style={{ transform: `translateX(-${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Thumbnail */}
        <div className="w-24 md:w-40 shrink-0 bg-gradient-to-br from-background to-border flex items-center justify-center text-3xl md:text-4xl">
          {link.thumbnail_url ? (
            <img
              src={link.thumbnail_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{icon}</span>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0 p-3 md:p-4 flex flex-col justify-center">
          <h3 className="text-sm md:text-base font-semibold leading-snug line-clamp-2 tracking-tight">
            {link.title}
          </h3>
          {link.description && (
            <p className="text-xs text-subtle leading-relaxed mt-1 line-clamp-2">
              {link.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-subtle bg-background px-2 py-0.5 rounded-md">
              {platformIcon} {link.platform}
            </span>
            <span className="text-[11px] text-muted">
              {formatDate(link.created_at)}
            </span>
          </div>
        </div>
      </a>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
