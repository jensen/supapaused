import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Database, Tables } from "types";

type PatternAccumulator = null | { type: "warning" | "paused"; name: string };

function extractProject(text: string) {
  const patterns = [
    /Your project ([^\(]+) has been paused/,
    /Your project ([^\(]+) \((https?:\/\/[^\)]+)\) has been paused/,
    /Your project ([^\(]+) was one of those/,
    /Your project ([^\(]+) \((https?:\/\/[^\)]+)\) was one of those/,
  ];

  return patterns.reduce<PatternAccumulator>((found, pattern, index) => {
    const match = text.match(pattern);

    if (match && match.length > 1) {
      return {
        type: index > 1 ? "warning" : "paused",
        name: match[1],
      };
    }

    return found;
  }, null);
}

async function getMessage(task) {
  const headers = new Headers({
    Authorization: `Bearer ${task.data.token}`,
    Accept: "application/json",
  });

  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${task.data.id}`,
    {
      headers,
    }
  );

  const messageData = (await response.json()) as {
    id: string;
    payload: {
      headers: { value: string; name: string }[];
      parts: { body: { data: string }; mimeType: string }[];
    };
  };
  const dateHeader = messageData.payload.headers.find(
    (header: { name: string; value: string }) => header.name === "Date"
  );
  const date = dateHeader ? new Date(dateHeader.value) : null;

  const text = messageData.payload.parts.find(
    (part) => part.mimeType === "text/plain"
  );

  if (text) {
    const content = atob(text.body.data);

    const project = extractProject(content);

    if (project && date) {
      return {
        ...project,
        date: date.toUTCString(),
        message_id: task.data.id,
        user_id: task.data.user_id,
      };
    }
  }
}

Deno.serve(async () => {
  const supabase = createClient<Database>(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  const { data: tasks } = await supabase.rpc("dequeue_task", { count: 30 });

  const batch: Pick<
    Tables<"events">,
    "name" | "type" | "date" | "message_id" | "user_id"
  >[] = await Promise.all(tasks.map(getMessage));

  if (batch.length > 0) {
    await supabase.from("events").insert(batch);
  }

  await Promise.all(
    tasks.map(({ id }) =>
      supabase.rpc("complete_task", {
        task_id: id,
        success: true,
      })
    )
  );

  return new Response(JSON.stringify({}), {
    headers: { "Content-Type": "application/json" },
  });
});
