import { PrimaryButton, DarkButton } from "@/lib/shared/button";
import { login } from "../login/actions";
import { createClient } from "@/utils/supabase/server";
import { SyncButton } from "@/lib/sync-button";
import Logo from "@/lib/brand/logo";

export default async function Header() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="flex flex-col sm:flex-row justify-between items-center p-4 space-y-8 sm:space-y-0">
      <a href="/">
        <Logo />
      </a>
      {user === null ? (
        <form className="flex space-x-2">
          <PrimaryButton formAction={login}>Sign In</PrimaryButton>
          <DarkButton formAction={login}>Sign Up</DarkButton>
        </form>
      ) : (
        <SyncButton />
      )}
    </header>
  );
}
