"use client";

import { useRouter } from "next/navigation";
import type { LinkType } from "@/lib/types";

type Filter = "all" | LinkType;

const items: { key: Filter; label: string; icon: string }[] = [
  { key: "all", label: "All Links", icon: "\uD83D\uDD17" },
  { key: "article", label: "Articles", icon: "\uD83D\uDCC4" },
  { key: "video", label: "Videos", icon: "\u25B6\uFE0F" },
  { key: "podcast", label: "Podcasts", icon: "\uD83C\uDFA7" },
];

function SettingsButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/settings")}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-subtle hover:bg-background rounded-lg transition"
    >
      {"\u2699\uFE0F"} Settings
    </button>
  );
}

export function Sidebar({
  filter,
  onFilterChange,
  onLogout,
}: {
  filter: Filter;
  onFilterChange: (f: Filter) => void;
  onLogout: () => void;
}) {
  return (
    <aside className="hidden md:flex flex-col w-52 shrink-0 bg-[#fafafa] border-r border-border">
      <div className="p-5 pb-4">
        <h1 className="text-lg font-semibold tracking-tight">Stash</h1>
      </div>
      <nav className="flex-1 space-y-0.5">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onFilterChange(item.key)}
            className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-sm transition ${
              filter === item.key
                ? "bg-border/60 text-foreground font-medium"
                : "text-subtle hover:bg-background"
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="border-t border-border p-3 space-y-1">
        <SettingsButton />
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
