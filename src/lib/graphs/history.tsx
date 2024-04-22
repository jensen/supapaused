"use client";

import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import { Tables } from "../../../supabase/types";

interface HistoryGraphProps {
  timeline: Tables<"events">[];
}

export default function HistoryGraph(props: HistoryGraphProps) {
  const minDate = "2020-12-03T00:00:00Z";

  const rows = props.timeline.length;

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(rows * 24);
  const marginLeft = 40;
  const marginRight = 100;

  const gxRef = useRef<SVGGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setHeight(rows * 24);
  }, [rows]);

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

  return (
    <div ref={containerRef}>
      <div className="text-zinc-400 overflow-x-auto">
        <svg width={width} height={height} onClick={() => setSelected(null)}>
          <g ref={gxRef} className="x-axis" transform={`translate(0,20)`} />
          <g>
            {[...props.timeline].reverse().map((d, i) => {
              const h = i * 20;

              return (
                <g
                  key={i}
                  onMouseOver={() => setHovered(d.name)}
                  onMouseOut={() => setHovered(null)}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelected((prev) => (prev === null ? d.name : null));
                  }}
                  style={{
                    opacity:
                      (selected === d.name || selected === null) &&
                      (hovered === d.name || hovered === null)
                        ? 1
                        : selected === null
                        ? 0.2
                        : selected === d.name
                        ? 1
                        : 0,
                    cursor: "pointer",
                    transition: "opacity ease-out 400ms 150ms",
                  }}
                >
                  <circle
                    cx={x(new Date(d.date))}
                    cy={60 + h}
                    r={6}
                    fill={
                      d.type === "paused"
                        ? `rgb(var(--paused-rgb))`
                        : `rgb(var(--warning-rgb))`
                    }
                  />
                  <text
                    dx={x(new Date(d.date)) + 12}
                    dy={65 + h}
                    fill="rgba(var(--foreground-rgb))"
                    style={{
                      fontSize: "14px",
                      fontFamily: "sans-serif",
                      userSelect: "none",
                    }}
                  >
                    {d.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
