import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url } = await request.json();
  if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Stash/1.0; +https://stash.app)",
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
      extractMeta(html, "description") ||
      "";
    const thumbnail_url =
      extractMeta(html, "og:image") ||
      extractMeta(html, "twitter:image") ||
      "";

    return NextResponse.json({ title, description, thumbnail_url });
  } catch {
    return NextResponse.json(
      { title: "", description: "", thumbnail_url: "" },
      { status: 200 }
    );
  }
}

function extractMeta(html: string, property: string): string {
  // Try property="..." first, then name="..."
  const propRegex = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`,
    "i"
  );
  const match = html.match(propRegex);
  if (match) return match[1];

  // Also try content before property
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
