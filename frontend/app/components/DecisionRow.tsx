"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Receipt } from "lucide-react";
import { useState } from "react";
import { formatMicroUsdc, formatTime } from "../lib/format";
import type { Decision } from "../lib/types";
import { cn } from "../lib/utils";
import { Copyable } from "./ui/Copyable";

export function DecisionRow({
  d,
  index,
  highlight,
}: {
  d: Decision;
  index: number;
  highlight: boolean;
}) {
  const [open, setOpen] = useState(false);
  const isPay = d.action === "PAY";
  const isRefuse = d.action === "REFUSE";

  const stripeClass = isPay
    ? "accent-stripe-emerald"
    : isRefuse
    ? "accent-stripe-rose"
    : "accent-stripe-amber";
  const actionTone = isPay
    ? "text-emerald-300"
    : isRefuse
    ? "text-rose-300"
    : "text-amber-300";

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
      className="relative"
    >
      <AnimatePresence>
        {highlight ? (
          <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            className={cn(
              "pointer-events-none absolute inset-0 rounded-xl",
              isPay
                ? "bg-emerald-500/10"
                : isRefuse
                ? "bg-rose-500/10"
                : "bg-amber-500/10",
            )}
          />
        ) : null}
      </AnimatePresence>

      <div
        className={cn(
          "group relative rounded-xl border border-white/[0.04] bg-white/[0.012] hover:border-white/10 transition-colors overflow-hidden",
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400/40"
        >
          <div className="grid grid-cols-[6px_auto_1fr_auto] gap-x-4 px-4 py-3.5 items-center">
            <span className={cn("h-9 w-[3px] rounded-full", stripeClass)} />
            <span className="font-mono text-[11px] text-zinc-600 tabnum w-8">
              #{String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <div className="flex items-baseline gap-3 min-w-0">
                <span
                  className={cn(
                    "text-[10px] font-mono uppercase tracking-[0.22em]",
                    actionTone,
                  )}
                >
                  {d.action}
                </span>
                <span className="text-sm font-medium text-zinc-100 truncate">
                  {d.service}
                </span>
                <span className="text-xs text-zinc-500 tabnum whitespace-nowrap">
                  {formatMicroUsdc(d.quotedMicroUsdc)}
                </span>
                {d.txHash ? (
                  <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] text-emerald-300/80 border border-emerald-500/30 bg-emerald-500/10 rounded-full px-1.5 py-[1px]">
                    onchain
                  </span>
                ) : null}
              </div>
              <div className="mt-1 text-sm text-zinc-400 leading-snug line-clamp-1 group-hover:text-zinc-300 transition-colors">
                {d.reason}
              </div>
            </div>
            <div className="flex items-center gap-3 whitespace-nowrap">
              <span className="text-[11px] text-zinc-600 font-mono tabnum">
                {formatTime(d.decidedAt)}
              </span>
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-zinc-600 group-hover:text-zinc-300"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </motion.span>
            </div>
          </div>
        </button>

        {(d.receiptId || d.txHash) && !open ? (
          <div className="px-4 pb-3 ml-[58px] flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-zinc-600">
            {d.receiptId ? (
              <span className="inline-flex items-center gap-1.5">
                <Receipt className="h-3 w-3" />
                <Copyable
                  value={d.receiptId}
                  label={`${d.receiptId.slice(0, 8)}…`}
                  className="hover:text-zinc-200"
                />
              </span>
            ) : null}
            {d.txHash ? (
              <a
                href={`https://basescan.org/tx/${d.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-emerald-300/80 hover:text-emerald-200"
              >
                tx {d.txHash.slice(0, 10)}…
                <ArrowUpRight className="h-3 w-3 opacity-70" />
              </a>
            ) : null}
          </div>
        ) : null}

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.26, ease: [0.2, 0.7, 0.2, 1] }}
              className="overflow-hidden border-t border-white/[0.04]"
            >
              <div className="px-4 py-4 ml-[58px] flex flex-col gap-3 bg-white/[0.01]">
                <Block label="Prompt to Venice" body={d.prompt} />
                <Block label="Venice raw response" body={d.rawResponse} accent />
                <div className="flex flex-wrap gap-4 text-[11px] font-mono">
                  {d.txHash ? (
                    <a
                      href={`https://basescan.org/tx/${d.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200"
                    >
                      inspect on basescan
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  ) : null}
                  {d.receiptId ? (
                    <Copyable
                      value={d.receiptId}
                      label={`copy receipt ${d.receiptId.slice(0, 8)}…`}
                      className="text-zinc-500 hover:text-zinc-200"
                    />
                  ) : null}
                  {d.txHash ? (
                    <Copyable
                      value={d.txHash}
                      label="copy tx hash"
                      className="text-zinc-500 hover:text-zinc-200"
                    />
                  ) : null}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.li>
  );
}

function Block({
  label,
  body,
  accent,
}: {
  label: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 mb-1.5 font-mono">
        {label}
      </div>
      <pre
        className={cn(
          "text-[11px] font-mono whitespace-pre-wrap break-words max-h-44 overflow-y-auto scrollbar-soft rounded-md border border-white/[0.04] bg-black/40 p-2.5",
          accent ? "text-emerald-200/90" : "text-zinc-400",
        )}
      >
        {body}
      </pre>
    </div>
  );
}
