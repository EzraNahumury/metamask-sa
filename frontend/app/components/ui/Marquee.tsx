"use client";

/**
 * Subtle ambient ticker bar. Items render twice in sequence so the
 * CSS `translate3d(-50%)` keyframe creates a seamless loop. Used as
 * a system-status flourish along the top of the dashboard.
 */
import { cn } from "../../lib/utils";

export function Marquee({
  items,
  className,
}: {
  items: React.ReactNode[];
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-12 z-10"
        style={{
          background:
            "linear-gradient(90deg, rgb(var(--bg)) 0%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-12 z-10"
        style={{
          background:
            "linear-gradient(270deg, rgb(var(--bg)) 0%, transparent 100%)",
        }}
      />
      <div className="ticker gap-10 px-4 py-2 text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-600">
        {[...items, ...items].map((node, i) => (
          <span key={i} className="inline-flex items-center gap-3 whitespace-nowrap">
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            {node}
          </span>
        ))}
      </div>
    </div>
  );
}
