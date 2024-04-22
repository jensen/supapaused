import { createClient } from "@/utils/supabase/server";
import History from "./history";

export default async function UserPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("events")
    .select()
    .order("date", { ascending: false })
    .eq("user_id", params.id);

  if (projects === null) {
    return null;
  }

  return <History projects={projects} />;
}
