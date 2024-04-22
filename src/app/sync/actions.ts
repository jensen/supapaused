"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function sync(formData: FormData) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
      scopes: "https://www.googleapis.com/auth/gmail.readonly",
      redirectTo: `${process.env.BASE_URL}/auth/callback/sync`,
    },
  });

  if (error) {
    redirect("/error");
  }

  if (data.url) {
    return redirect(data.url);
  }

  revalidatePath("/", "layout");
  redirect("/");
}
