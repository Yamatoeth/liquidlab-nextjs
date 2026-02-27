import { getSupabaseAdminClient } from "@/lib/server/supabaseAdmin";

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  if (!userId) return false;

  const supabase = getSupabaseAdminClient();
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("current_period_end", nowIso)
    .limit(1);

  if (error) return false;
  return Array.isArray(data) && data.length > 0;
}

export default hasActiveSubscription;
