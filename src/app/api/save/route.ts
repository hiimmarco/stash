import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateApiKey } from "@/lib/api-key-auth";
import { detectLinkInfo } from "@/lib/detect";

/**
 * External save endpoint — authenticated via API key (Bearer token).
 * Used by iOS Shortcut and other external clients.
 *
 * Saves immediately with whatever title/url the client provides,
 * then enriches metadata in the background so the response is fast.
 */
export async function POST(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const body = await request.json();
  const { url, title: clientTitle } = body;

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const detected = detectLinkInfo(url);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Save immediately with the title the client provided (fast)
  const { data, error } = await supabase
    .from("links")
    .insert({
      user_id: auth.user_id,
      url,
      title: clientTitle || url,
      description: null,
      thumbnail_url: null,
      type: detected.type,
      domain: detected.domain,
      platform: detected.platform,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Enrich with metadata in the background (won't block the response)
  if (data?.id) {
    enrichMetadata(data.id, url, supabase).catch(() => null);
  }

  return NextResponse.json({ success: true, link: data }, { status: 201 });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function enrichMetadata(id: string, url: string, supabase: any) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Stash/1.0; +https://stash.app)",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const html = await res.text();

    const title =
      extractMeta(html, "og:title") ||
      extractMeta(html, "twitter:title") ||
      extractTag(html, "title") ||
      "";
    const description =
      extractMeta(html, "og:description") ||
      extractMeta(html, "twitter:description") ||
      null;
    const thumbnail_url =
      extractMeta(html, "og:image") ||
      extractMeta(html, "twitter:image") ||
      null;

    if (title || description || thumbnail_url) {
      await supabase
        .from("links")
        .update({ title: title || undefined, description, thumbnail_url })
        .eq("id", id);
    }
  } catch {
    // Enrichment failed — link is already saved, this is best-effort
  }
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
