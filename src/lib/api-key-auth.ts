import { createClient } from "@supabase/supabase-js";

/**
 * Validates an API key and returns the associated user_id.
 * Uses the service-level Supabase client to bypass RLS.
 */
export async function validateApiKey(
  request: Request
): Promise<{ user_id: string } | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const apiKey = authHeader.slice(7);
  if (!apiKey) return null;

  // Use the service role client to look up the key (bypasses RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("api_keys")
    .select("user_id")
    .eq("key", apiKey)
    .single();

  if (error || !data) return null;
  return { user_id: data.user_id };
}
