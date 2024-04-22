"use client";

import HistoryGraph from "@/lib/graphs/history";
import { useEffect, useState } from "react";
import { createClient as createBrowserClient } from "@/utils/supabase/client";
import { Tables } from "../../../../../supabase/types";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface HistoryProps {
  projects: Tables<"events">[];
}

export default function History(props: HistoryProps) {
  const [projects, setProjects] = useState(props.projects);

  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase
      .channel("realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "events",
        },
        (payload: RealtimePostgresChangesPayload<Tables<"events">>) => {
          if (payload.eventType === "INSERT") {
            setProjects((prev) => {
              const projects = [...prev, payload.new].sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              );

              return projects;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <HistoryGraph timeline={projects} />;
}
