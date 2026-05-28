"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Image as ImageIcon, Mic2, Play, Sparkles } from "lucide-react";
import { useState } from "react";
import { fetchFridayBrief, type FridayBrief } from "../lib/friday-brief";
import { cn, formatError } from "../lib/utils";
import { GlassCard } from "./ui/GlassCard";
import { PrimaryButton } from "./ui/PrimaryButton";

export default function FridayBriefPanel() {
  const [brief, setBrief] = useState<FridayBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onGenerate() {
    setLoading(true);
    setError(null);
    try {
      const b = await fetchFridayBrief();
      setBrief(b);
    } catch (e) {
      setError(formatError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard variant="strong" className="mb-8 overflow-hidden">
      <div className="relative p-6 sm:p-7">
        <header className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6 mb-5">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border border-white/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                Friday <span className="text-grad">Brief</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-1 max-w-md leading-relaxed">
                Three Venice endpoints in one report — text reasoning, a generated chart image,
                and a 60-second voiceover.
              </p>
            </div>
          </div>
          <div className="sm:ml-auto">
            <PrimaryButton onClick={onGenerate} loading={loading}>
              <Sparkles className="h-4 w-4" />
              {brief ? "Regenerate" : "Generate Friday Brief"}
            </PrimaryButton>
          </div>
        </header>

        <AnimatePresence>
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 rounded-lg border border-rose-700/40 bg-rose-950/30 px-3 py-2 text-sm text-rose-200"
            >
              {error}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {loading ? <BriefSkeleton /> : null}
        {!loading && !brief && !error ? <BriefEmpty /> : null}
        {!loading && brief ? <BriefBody brief={brief} /> : null}
      </div>
    </GlassCard>
  );
}

function BriefEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl border border-dashed border-white/10 px-6 py-10 text-center text-sm text-zinc-500"
    >
      No brief yet. The button costs about{" "}
      <span className="text-zinc-300">$0.03</span> of Venice credit.
    </motion.div>
  );
}

function BriefSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="skeleton h-6 w-2/3 rounded" />
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-5/6 rounded" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] p-3">
            <div className="skeleton h-2.5 w-1/2 rounded mb-2" />
            <div className="skeleton h-5 w-2/3 rounded" />
          </div>
        ))}
      </div>
      <div className="skeleton h-48 rounded-xl" />
      <div className="skeleton h-10 rounded-xl" />
    </div>
  );
}

function BriefBody({ brief }: { brief: FridayBrief }) {
  const audioSrc =
    brief.audioBase64 != null
      ? `data:${brief.audioMimeType};base64,${brief.audioBase64}`
      : null;
  const imageSrc =
    brief.chartImageBase64 != null
      ? `data:image/webp;base64,${brief.chartImageBase64}`
      : null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
      }}
      className="flex flex-col gap-5"
    >
      <Reveal>
        <h3 className="text-lg font-semibold text-emerald-300 tracking-tight">{brief.headline}</h3>
        <p className="text-sm text-zinc-300 mt-2 leading-relaxed whitespace-pre-line">
          {brief.summary}
        </p>
      </Reveal>

      <Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Paid this week" value={`$${brief.spendPaidUsd.toFixed(2)}`} accent="emerald" />
          <Stat label="Refused" value={`$${brief.spendRefusedUsd.toFixed(2)}`} accent="rose" />
          <Stat label="Decisions" value={String(brief.stats.decisionCount)} />
          <Stat label="Onchain txs" value={String(brief.stats.txHashCount)} accent="sky" />
        </div>
      </Reveal>

      {imageSrc ? (
        <Reveal>
          <div className="relative rounded-xl overflow-hidden border border-white/10 bg-zinc-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt="Venice-generated weekly spending chart"
              className="w-full h-auto"
            />
            <div className="absolute top-2 left-2 inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-black/40 backdrop-blur px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-zinc-300">
              <ImageIcon className="h-3 w-3" /> Venice image
            </div>
          </div>
        </Reveal>
      ) : null}

      {audioSrc ? (
        <Reveal>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-2">
              <Mic2 className="h-3 w-3" /> Voice narration · Venice audio
            </div>
            <audio controls src={audioSrc} className="w-full" />
          </div>
        </Reveal>
      ) : null}

      {brief.cancellationSuggestions.length > 0 ? (
        <Reveal>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
            <h4 className="text-[11px] uppercase tracking-[0.18em] text-amber-300 mb-2">
              Cancellation candidates
            </h4>
            <ul className="flex flex-col gap-1.5 text-sm">
              {brief.cancellationSuggestions.map((s) => (
                <li key={s.service} className="text-amber-100">
                  <span className="font-medium">{s.service}</span>
                  <span className="text-amber-200/70"> — {s.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      ) : null}

      <Reveal>
        <div className="text-[11px] text-zinc-600 font-mono inline-flex items-center gap-2">
          <Play className="h-3 w-3" />
          generated {new Date(brief.generatedAt).toLocaleString()} · window{" "}
          {new Date(brief.weekStart).toLocaleDateString()} →{" "}
          {new Date(brief.weekEnd).toLocaleDateString()}
        </div>
      </Reveal>
    </motion.div>
  );
}

function Reveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 6 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "emerald" | "rose" | "sky";
}) {
  const tone =
    accent === "emerald"
      ? "text-emerald-300"
      : accent === "rose"
      ? "text-rose-300"
      : accent === "sky"
      ? "text-sky-300"
      : "text-zinc-100";
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className={cn("mt-0.5 text-xl font-semibold tracking-tight tabular-nums", tone)}>
        {value}
      </div>
    </div>
  );
}
