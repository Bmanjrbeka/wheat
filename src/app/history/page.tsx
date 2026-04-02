import { createServerSupabaseClient } from "@/lib/supabase-server";
import { HistoryClient } from "./HistoryClient";
import { redirect } from "next/navigation";
import type { DetectionRecord } from "@/types";

export default async function HistoryPage() {
  const supabase = await createServerSupabaseClient();

  // Auth check (middleware also guards this, double safety)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/history");

  // Fetch this user's detection history
  const { data, error } = await supabase
    .from("detection_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) console.error("History fetch error:", error.message);

  const records = (data ?? []) as DetectionRecord[];

  return <HistoryClient records={records} />;
}
