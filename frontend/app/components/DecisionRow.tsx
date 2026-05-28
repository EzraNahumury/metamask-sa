"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, ExternalLink, Receipt } from "lucide-react";
import { useState } from "react";
import { formatMicroUsdc, formatTime } from "../lib/format";
import type { Decision } from "../lib/types";
import { cn } from "../lib/utils";

export function DecisionRow({ d, highlight }: { d: Decision; highlight: boolean }) {
  const [open, setOpen] = useState(false);
  const isPay = d.action === "PAY";
  const isRefuse = d.action === "REFUSE";

  const tone = isPay
    ? "border-emerald-500/25 from-emerald-500/[0.06]"
    : isRefuse
    ? "border-rose-500/25 from-rose-500/[0.06]"
    : "border-amber-500/25 from-amber-500/[0.06]";

  const tagClass = isPay
    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
    : isRefuse
    ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
    : "border-amber-500/40 bg-amber-500/10 text-amber-300";

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -6, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
      className={cn(
        "relative rounded-xl border bg-gradient-to-b to-transparent backdrop-blur overflow-hidden",
        tone,
      )}
    >
      <AnimatePresence>
        {highlight ? (
          <motion.div
            initial={{ opacity: 0.45 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className={cn(
              "pointer-events-none absolute inset-0",
              isPay ? "bg-emerald-500/15" : isRefuse ? "bg-rose-500/15" : "bg-amber-500/15",
            )}
          />
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative w-full text-left px-4 py-3.5 group focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400/40 rounded-xl"
      >
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={cn(
                "text-[10px] font-mono uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-md border",
                tagClass,
              )}
            >
              {d.action}
            </span>
            <span className="text-sm font-medium text-zinc-100 truncate">{d.service}</span>
            <span className="text-xs whitespace-nowrap text-zinc-400 tabular-nums">
              {formatMicroUsdc(d.quotedMicroUsdc)}
            </span>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-[11px] text-zinc-500 tabular-nums">
              {formatTime(d.decidedAt)} · conf {d.confidence.toFixed(2)}
            </span>
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-zinc-500 group-hover:text-zinc-300"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </motion.span>
          </div>
        </div>
        <div className="text-sm text-zinc-300 mt-1.5 leading-relaxed">{d.reason}</div>
        {d.receiptId || d.txHash ? (
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-500 font-mono items-center">
            {d.receiptId ? (
              <span className="inline-flex items-center gap-1.5">
                <Receipt className="h-3 w-3" /> {d.receiptId.slice(0, 8)}…
              </span>
            ) : null}
            {d.txHash ? (
              <a
                href={`https://basescan.org/tx/${d.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 transition-colors"
              >
                <ExternalLink className="h-3 w-3" /> {d.txHash.slice(0, 12)}…
                <ArrowRight className="h-3 w-3 opacity-60" />
              </a>
            ) : null}
          </div>
        ) : null}
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
            className="relative overflow-hidden border-t border-white/[0.05]"
          >
            <div className="px-4 py-3 flex flex-col gap-3 bg-white/[0.015]">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-1.5">
                  Prompt to Venice
                </div>
                <pre className="text-[11px] text-zinc-400 font-mono whitespace-pre-wrap break-words max-h-48 overflow-y-auto scrollbar-soft bg-black/30 rounded-md p-2.5 border border-white/[0.04]">
                  {d.prompt}
                </pre>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-1.5">
                  Venice raw response
                </div>
                <pre className="text-[11px] text-zinc-300 font-mono whitespace-pre-wrap break-words max-h-32 overflow-y-auto scrollbar-soft bg-black/30 rounded-md p-2.5 border border-white/[0.04]">
                  {d.rawResponse}
                </pre>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.li>
  );
}
