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

// How far to swipe to trigger each action
const ARCHIVE_THRESHOLD = 80;
const DELETE_THRESHOLD = 180;
const MAX_SWIPE = 200;

export function LinkCard({
  link,
  onDelete,
  onArchive,
}: {
  link: Link;
  onDelete: (id: string) => void;
  onArchive: (id: string, archive: boolean) => void;
}) {
  const [offset, setOffset] = useState(0);
  const [hovered, setHovered] = useState(false);
  const startX = useRef(0);
  const dragging = useRef(false);

  function handleTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
    dragging.current = true;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!dragging.current) return;
    const diff = startX.current - e.touches[0].clientX;
    if (diff > 0) setOffset(Math.min(diff, MAX_SWIPE));
    else setOffset(0);
  }

  function handleTouchEnd() {
    dragging.current = false;
    if (offset >= DELETE_THRESHOLD) {
      onDelete(link.id);
    } else if (offset >= ARCHIVE_THRESHOLD) {
      onArchive(link.id, !link.is_archived);
    }
    setOffset(0);
  }

  const icon = typeIcons[link.type] || "\uD83D\uDCC4";
  const platformIcon = platformIcons[link.platform] || "\uD83C\uDF10";

  // Determine which swipe zone is active
  const showDelete = offset >= DELETE_THRESHOLD;
  const showArchive = offset >= ARCHIVE_THRESHOLD && !showDelete;

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Swipe action zones (mobile) */}
      <div className="absolute inset-0 flex rounded-2xl overflow-hidden">
        {/* Archive zone */}
        <div
          className={`flex-1 flex items-center justify-end transition-colors duration-150 ${
            showArchive ? "bg-neutral-400" : "bg-neutral-300"
          }`}
        >
          <span className="text-white text-xs font-semibold pr-5">
            {link.is_archived ? "Unarchive" : "Archive"}
          </span>
        </div>
        {/* Delete zone — slides in as swipe extends past archive */}
        <div
          className={`flex items-center justify-center transition-all duration-150 ${
            showDelete ? "bg-red-500 w-24" : "w-0 overflow-hidden"
          }`}
        >
          <span className="text-white text-xs font-semibold whitespace-nowrap">
            Delete
          </span>
        </div>
      </div>

      {/* Card */}
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex bg-card border border-border rounded-2xl overflow-hidden"
        style={{
          transform: `translateX(-${offset}px)`,
          transition: dragging.current ? "none" : "transform 0.25s ease",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Thumbnail */}
        <div className="w-24 md:w-40 shrink-0 bg-gradient-to-br from-background to-border flex items-center justify-center text-3xl md:text-4xl overflow-hidden">
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
          <h3 className={`text-sm md:text-base font-semibold leading-snug line-clamp-2 tracking-tight ${link.is_archived ? "text-muted" : ""}`}>
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
            {link.is_archived && (
              <span className="text-[11px] text-muted bg-background px-2 py-0.5 rounded-md">
                Archived
              </span>
            )}
          </div>
        </div>

        {/* Desktop hover actions */}
        {hovered && (
          <div
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1.5"
            onClick={(e) => e.preventDefault()}
          >
            <button
              onClick={(e) => { e.preventDefault(); onArchive(link.id, !link.is_archived); }}
              className="px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-medium text-subtle hover:text-foreground hover:border-foreground/30 transition shadow-sm"
            >
              {link.is_archived ? "Unarchive" : "Archive"}
            </button>
            <button
              onClick={(e) => { e.preventDefault(); onDelete(link.id); }}
              className="px-3 py-1.5 rounded-lg bg-card border border-red-200 text-xs font-medium text-red-400 hover:text-red-600 hover:border-red-400 transition shadow-sm"
            >
              Delete
            </button>
          </div>
        )}
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
