import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode, demoDeleteLink } from "@/lib/demo-store";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (isDemoMode()) {
    demoDeleteLink(id);
    return NextResponse.json({ success: true });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("links")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
