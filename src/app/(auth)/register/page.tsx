import Image from "next/image";
import { DarkButton, PrimaryButton } from "@/lib/shared/button";
import Link from "next/link";
import { login } from "@/app/login/actions";

export default async function Home() {
  return (
    <div className="h-full grid place-content-center">
      <div className="flex flex-col items-center space-y-12">
        <h3 className="text-brand font-bold text-6xl">Track Your Instances</h3>
        <form>
          <p className="max-w-xl text-xl text-center">
            Clicking the{" "}
            <PrimaryButton formAction={login}>Sign In</PrimaryButton> button
            will prompt you to authenticate using your Google credentials.
          </p>
        </form>
        <p className="max-w-4xl p-4 bg-amber-500/10 border border-amber-500 text-amber-200 rounded text-center">
          Basic account creation does <strong>not</strong> require access to a
          gmail inbox. Once you authenticate, you can click the{" "}
          <strong>Sync</strong> button to provide temporarily elevated
          privileges with read-only access to your inbox.
        </p>
        <p className="max-w-2xl text-xl">
          With your permission, Supapaused scans your inbox for email using{" "}
          <span className="text-sm px-1 py-0.5 rounded bg-inky border border-zinc-600 font-mono">
            from:ant@supabase.io subject:Your Supabase Instance
          </span>{" "}
          as a query.
        </p>
        <Link href="/instances">
          <PrimaryButton>View Public Instances</PrimaryButton>
        </Link>
      </div>
    </div>
  );
}
