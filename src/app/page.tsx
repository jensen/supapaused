import Image from "next/image";
import { DarkButton, PrimaryButton } from "@/lib/shared/button";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import Logo from "@/lib/brand/logo";

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-24">
      <div className="scale-200 transition-transform ease-in duration-300 hover:scale-300">
        <Logo />
      </div>
      <section className="max-w-5xl flex flex-col sm:flex-row items-start justify-center space-y-6 sm:space-y-0 sm:space-x-6 px-4 sm:px-12">
        <Image
          src={"/ant.png"}
          width={256}
          height={256}
          alt="Ant Wilson, CTO and Co-Founder of Supabase"
          className="border-2 border-zinc-800 rounded-xl bg-emerald-500"
        />
        <div className="h-full flex flex-col items-start space-y-8">
          <div className="space-y-2">
            <h3 className="font-bold text-5xl text-brand">
              Your Supabase Instance
            </h3>
            <p className="font-light text-xl text-zinc-300">
              To save on cloud resources I just did a scan of all our projects
              and identified those which have been inactive for more than 7
              days.
            </p>
          </div>
          <div className="flex space-x-4">
            <Link href={user === null ? "/register" : `/users/${user.id}`}>
              <PrimaryButton>Track Your Paused Instances</PrimaryButton>
            </Link>
            <Link href="/instances">
              <DarkButton>View Public Instances</DarkButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
