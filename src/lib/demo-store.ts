import type { Link } from "./types";
import { randomUUID } from "crypto";
import { detectLinkInfo } from "./detect";

const links: Link[] = [];

export function isDemoMode() {
  return process.env.DEMO_MODE === "true";
}

export function demoGetLinks(): Link[] {
  return [...links].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function demoAddLink(input: {
  url: string;
  title?: string;
  description?: string | null;
  thumbnail_url?: string | null;
}): Link {
  const detected = detectLinkInfo(input.url);
  const link: Link = {
    id: randomUUID(),
    user_id: "demo",
    url: input.url,
    title: input.title || input.url,
    description: input.description || null,
    thumbnail_url: input.thumbnail_url || null,
    type: detected.type,
    domain: detected.domain,
    platform: detected.platform,
    is_archived: false,
    created_at: new Date().toISOString(),
  };
  links.push(link);
  return link;
}

export function demoDeleteLink(id: string): boolean {
  const idx = links.findIndex((l) => l.id === id);
  if (idx === -1) return false;
  links.splice(idx, 1);
  return true;
}

export function demoArchiveLink(id: string, is_archived: boolean): boolean {
  const link = links.find((l) => l.id === id);
  if (!link) return false;
  link.is_archived = is_archived;
  return true;
}
