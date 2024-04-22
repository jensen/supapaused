import { createClient } from "@/utils/supabase/server";
import LeaderboardGraph from "@/lib/graphs/leaderboard";

export default async function InstancesPage() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("events")
    .select()
    .order("date", { ascending: false });

  const { data: users } = await supabase.from("profiles").select();

  return <LeaderboardGraph users={users ?? []} timeline={projects ?? []} />;
}
