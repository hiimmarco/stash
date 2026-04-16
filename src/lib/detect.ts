import type { LinkType } from "./types";

interface DetectedInfo {
  type: LinkType;
  platform: string;
  domain: string;
}

export function detectLinkInfo(url: string): DetectedInfo {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { type: "article", platform: url, domain: url };
  }

  const hostname = parsed.hostname.replace("www.", "");
  const domain = hostname;

  // YouTube
  if (
    hostname.includes("youtube.com") ||
    hostname.includes("youtu.be") ||
    hostname.includes("m.youtube.com")
  ) {
    return { type: "video", platform: "YouTube", domain };
  }

  // Vimeo
  if (hostname.includes("vimeo.com")) {
    return { type: "video", platform: "Vimeo", domain };
  }

  // Spotify
  if (hostname.includes("spotify.com") || hostname.includes("open.spotify.com")) {
    const isEpisode =
      parsed.pathname.includes("/episode") ||
      parsed.pathname.includes("/show");
    if (isEpisode) {
      return { type: "podcast", platform: "Spotify", domain };
    }
    return { type: "podcast", platform: "Spotify", domain };
  }

  // Apple Podcasts
  if (hostname.includes("podcasts.apple.com")) {
    return { type: "podcast", platform: "Apple Podcasts", domain };
  }

  // Twitch
  if (hostname.includes("twitch.tv")) {
    return { type: "video", platform: "Twitch", domain };
  }

  // Default: article
  return { type: "article", platform: domain, domain };
}
