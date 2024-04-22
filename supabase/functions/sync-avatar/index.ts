import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const { id } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  const { data: users } = await supabase.from("profiles").select().eq("id", id);

  if (users.length === 1) {
    const user = users[0];

    if (user.avatar) {
      const file = await fetch(user.avatar);

      const contentType = file.headers.get("Content-Type");

      const { error } = await supabase.storage
        .from("profiles")
        .upload(`${user.id}/profile.jpg`, file.body, {
          contentType,
          cacheControl: "3600",
          upsert: true,
        });

      console.log(error);

      await supabase
        .from("profiles")
        .update({
          avatar: null,
        })
        .eq("id", id);
    }
  }

  return new Response(JSON.stringify({}), {
    headers: { "Content-Type": "application/json" },
  });
});
