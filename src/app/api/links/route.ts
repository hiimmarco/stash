import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { detectLinkInfo } from "@/lib/detect";
import { isDemoMode, demoGetLinks, demoAddLink } from "@/lib/demo-store";

export async function GET(request: NextRequest) {
  const archived = request.nextUrl.searchParams.get("archived") === "true";

  if (isDemoMode()) {
    const links = demoGetLinks().filter((l) => l.is_archived === archived);
    return NextResponse.json(links);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_archived", archived)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url, title, description, thumbnail_url } = body;

  if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

  if (isDemoMode()) {
    const link = demoAddLink({ url, title, description, thumbnail_url });
    return NextResponse.json(link, { status: 201 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const detected = detectLinkInfo(url);

  const { data, error } = await supabase
    .from("links")
    .insert({
      user_id: user.id,
      url,
      title: title || url,
      description: description || null,
      thumbnail_url: thumbnail_url || null,
      type: detected.type,
      domain: detected.domain,
      platform: detected.platform,
      is_archived: false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
