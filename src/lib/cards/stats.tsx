import { Tables } from "../../../supabase/types";

interface StatsProps {
  projects: Tables<"events">[];
}

export default function Stats(props: StatsProps) {
  const unique = Array.from(new Set(props.projects.map((d) => d.name)));

  return (
    <section className="px-6 grid grid-cols-3 gap-4">
      <div className=" p-4 bg-zinc-800 border border-zinc-600 rounded shadow-[0_0px_rgba(255,0,0,1)]">
        <h4 className="space-x-2">
          <span className="text-6xl font-black">{unique.length}</span>
          <span className="text-4xl font-semibold">Projects</span>
        </h4>
      </div>
    </section>
  );
}
