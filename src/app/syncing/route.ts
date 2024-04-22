import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");

  if (token) {
    const supabase = createClient();

    const url = new URL(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages"
    );

    url.searchParams.append(
      "q",
      "from:ant@supabase.io subject:Your Supabase Instance"
    );

    const headers = new Headers({
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    });

    const response = await fetch(url, {
      headers,
    });

    const { messages } = (await response.json()) as {
      messages: { id: string }[];
    };

    const existing: Record<string, boolean> = {};
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user === null) {
      return NextResponse.redirect(`${origin}/`);
    }

    const { data: events } = await supabase
      .from("events")
      .select()
      .eq("user_id", user?.id);

    for (const event of events ?? []) {
      if (event.message_id) {
        existing[event.message_id] = true;
      }
    }

    await Promise.all(
      messages
        .filter((message) => existing[message.id] === undefined)
        .map(({ id }) =>
          supabase.rpc("enqueue_task", {
            data: { token, id, user_id: user.id },
            priority: 1,
          })
        )
    );

    if (user) {
      return NextResponse.redirect(`${origin}/users/${user.id}`);
    }

    return NextResponse.redirect(`${origin}/`);
  }
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
