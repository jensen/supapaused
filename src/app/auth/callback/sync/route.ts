import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { type CookieOptions, createServerClient } from "@supabase/ssr";

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

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(
        `${origin}/syncing?token=${data?.session?.provider_token}`
      );
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
