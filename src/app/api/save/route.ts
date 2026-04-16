import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateApiKey } from "@/lib/api-key-auth";
import { detectLinkInfo } from "@/lib/detect";

/**
 * External save endpoint — authenticated via API key (Bearer token).
 * Used by iOS Shortcut and other external clients.
 */
export async function POST(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const body = await request.json();
  const { url } = body;

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  // Fetch metadata
  let title = url;
  let description: string | null = null;
  let thumbnail_url: string | null = null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Stash/1.0; +https://stash.app)",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const html = await res.text();

    title = extractMeta(html, "og:title") || extractMeta(html, "twitter:title") || extractTag(html, "title") || url;
    description = extractMeta(html, "og:description") || extractMeta(html, "twitter:description") || null;
    thumbnail_url = extractMeta(html, "og:image") || extractMeta(html, "twitter:image") || null;
  } catch {
    // Metadata fetch failed — save with URL as title
  }

  const detected = detectLinkInfo(url);

  // Use service role client to insert (bypasses RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("links")
    .insert({
      user_id: auth.user_id,
      url,
      title,
      description,
      thumbnail_url,
      type: detected.type,
      domain: detected.domain,
      platform: detected.platform,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, link: data }, { status: 201 });
}

function extractMeta(html: string, property: string): string {
  const propRegex = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`,
    "i"
  );
  const match = html.match(propRegex);
  if (match) return match[1];
  const reverseRegex = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`,
    "i"
  );
  const reverseMatch = html.match(reverseRegex);
  return reverseMatch ? reverseMatch[1] : "";
}

function extractTag(html: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i");
  const match = html.match(regex);
  return match ? match[1].trim() : "";
}
