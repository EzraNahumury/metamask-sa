"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export type DecisionFilter = "all" | "pay" | "refuse" | "onchain";

const TABS: Array<{ id: DecisionFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "pay", label: "Paid" },
  { id: "refuse", label: "Refused" },
  { id: "onchain", label: "Onchain" },
];

export function DecisionFilters({
  value,
  onChange,
  counts,
}: {
  value: DecisionFilter;
  onChange: (v: DecisionFilter) => void;
  counts: Record<DecisionFilter, number>;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.015] p-1">
      {TABS.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              "relative h-7 px-2.5 rounded-lg text-[11px] font-medium transition-colors inline-flex items-center gap-1.5",
              active ? "text-zinc-50" : "text-zinc-500 hover:text-zinc-200",
            )}
          >
            {active ? (
              <motion.span
                layoutId="filter-pill"
                className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.06]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            ) : null}
            <span className="relative">{t.label}</span>
            <span className="relative text-[10px] text-zinc-500 tabnum">
              {counts[t.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
