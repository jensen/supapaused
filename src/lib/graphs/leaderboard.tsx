"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import { Tables } from "../../../supabase/types";

interface LeaderboardGraphProps {
  timeline: Tables<"events">[];
  users: Tables<"profiles">[];
}

export default function LeaderboardGraph(props: LeaderboardGraphProps) {
  const router = useRouter();
  const minDate = "2020-12-03T00:00:00Z";

  const [width, setWidth] = useState(0);
  const height = props.users ? 100 + props.users.length * 48 : 0;
  const marginLeft = 180;
  const marginRight = 100;

  const gxRef = useRef<SVGGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [hovered, setHovered] = useState<string | null>(null);

  const x = d3
    .scaleUtc()
    .domain([new Date(minDate), new Date()])
    .range([marginLeft, width - marginRight]);

  useEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver((entries) => {
        if (containerRef.current) {
          setWidth(containerRef.current.getBoundingClientRect().width);
        }
      });

      observer.observe(containerRef.current);
    }
  }, []);

  useEffect(() => {
    const ticks = d3.axisTop(x).ticks(d3.utcMonth.every(3));
    const { call } = d3.select(gxRef.current);

    d3.select(gxRef.current).call(ticks as Parameters<typeof call>[0]);
  }, [x]);

  const users = [...props.timeline].reverse().reduce(
    (users, event) => {
      users[event.user_id].events.push(event);

      return users;
    },
    props.users.reduce((users, user) => {
      users[user.id] = {
        user,
        events: [],
      };

      return users;
    }, {} as Record<string, { user: Tables<"profiles">; events: Tables<"events">[] }>)
  );

  return (
    <div ref={containerRef}>
      <div className="text-zinc-400 overflow-x-auto">
        <svg width={width} height={height}>
          <g ref={gxRef} className="x-axis" transform={`translate(32,20)`} />
          {Object.entries(users).map(([user_id, { user, events }], index) => {
            return (
              <g
                key={user_id}
                transform={`translate(32, ${60 + index * 48})`}
                onMouseOver={() => {
                  setHovered(user.id);
                  router.prefetch(`/users/${user.id}`);
                }}
                onMouseOut={() => setHovered(null)}
                style={{
                  cursor: "pointer",
                  transition: "opacity ease-out 400ms 0ms",
                  opacity: hovered === user.id || hovered === null ? 1 : 0.2,
                }}
                onClick={() => router.push(`/users/${user.id}`)}
              >
                <rect width={width} height={48} fill="transparent" />
                <g>
                  <image
                    href={
                      user.avatar ??
                      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profiles/${user.id}/profile.jpg`
                    }
                    width={32}
                    height={32}
                    clipPath={`inset(0% round 16px)`}
                  />
                  <text
                    dx={48}
                    dy={20}
                    fill="rgba(var(--foreground-rgb))"
                    style={{
                      fontSize: "14px",
                      fontFamily: "sans-serif",
                      userSelect: "none",
                    }}
                  >
                    {user.name}
                  </text>
                </g>
                {events.map((d, i) => {
                  return (
                    <g key={i}>
                      <circle
                        cx={x(new Date(d.date))}
                        cy={16}
                        r={12}
                        fill={
                          d.type === "paused"
                            ? `rgb(var(--paused-rgb))`
                            : `rgb(var(--warning-rgb))`
                        }
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
