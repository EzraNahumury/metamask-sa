"use client";

import { cn } from "../../lib/utils";

type State = "live" | "connecting" | "offline";

export function StatusDot({ state, label }: { state: State; label?: string }) {
  const color =
    state === "live"
      ? "bg-emerald-400 shadow-emerald-400/50"
      : state === "connecting"
      ? "bg-amber-300 shadow-amber-300/40"
      : "bg-rose-500 shadow-rose-500/40";
  return (
    <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
      <span className="relative inline-flex h-2 w-2">
        <span
          className={cn(
            "absolute inset-0 rounded-full opacity-60",
            state === "live" && "pulse-soft",
            color,
          )}
        />
        <span className={cn("relative inline-block h-2 w-2 rounded-full shadow-[0_0_12px_2px]", color)} />
      </span>
      <span>{label ?? `agent ${state}`}</span>
    </span>
  );
}
