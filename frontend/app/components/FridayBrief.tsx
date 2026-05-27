"use client";

import { useState } from "react";
import { fetchFridayBrief, type FridayBrief } from "../lib/friday-brief";

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
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900/40 to-zinc-950 p-6 mb-8">
      <header className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-50">
            Friday <span className="text-emerald-400">Brief</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1 max-w-md">
            Three Venice endpoints — text reasoning, generated chart image, and a
            sixty-second voiceover. One report.
          </p>
        </div>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="sm:ml-auto px-4 py-2 rounded-lg bg-emerald-500 text-emerald-950 text-sm font-medium hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {loading ? "Generating…" : brief ? "Regenerate" : "Generate Friday Brief"}
        </button>
      </header>

      {error ? (
        <div className="rounded-lg border border-rose-800/60 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {!brief && !loading && !error ? (
        <div className="rounded-xl border border-dashed border-zinc-800 px-6 py-10 text-center text-zinc-500 text-sm">
          No brief yet. The button above costs about $0.03 of Venice credit.
        </div>
      ) : null}

      {brief ? <BriefBody brief={brief} /> : null}
    </section>
  );
}

function BriefBody({ brief }: { brief: FridayBrief }) {
  const audioSrc =
    brief.audioBase64 != null
      ? `data:${brief.audioMimeType};base64,${brief.audioBase64}`
      : null;
  // Venice's /image/generate returns WEBP; fall back to "image" prefix so
  // any future codec change still renders.
  const imageSrc =
    brief.chartImageBase64 != null
      ? `data:image/webp;base64,${brief.chartImageBase64}`
      : null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-lg font-semibold text-emerald-300">{brief.headline}</h3>
        <p className="text-sm text-zinc-300 mt-2 whitespace-pre-line leading-relaxed">
          {brief.summary}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <BriefStat label="Paid this week" value={`$${brief.spendPaidUsd.toFixed(2)}`} accent="emerald" />
        <BriefStat label="Refused" value={`$${brief.spendRefusedUsd.toFixed(2)}`} accent="rose" />
        <BriefStat label="Decisions" value={String(brief.stats.decisionCount)} />
        <BriefStat label="Onchain txs" value={String(brief.stats.txHashCount)} />
      </div>

      {imageSrc ? (
        <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt="Venice-generated weekly spending chart"
            className="w-full h-auto"
          />
        </div>
      ) : null}

      {audioSrc ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
            Voice narration
          </div>
          <audio controls src={audioSrc} className="w-full" />
        </div>
      ) : null}

      {brief.cancellationSuggestions.length > 0 ? (
        <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-4">
          <h4 className="text-xs uppercase tracking-wider text-amber-300 mb-2">
            Cancellation candidates
          </h4>
          <ul className="flex flex-col gap-2 text-sm text-amber-100">
            {brief.cancellationSuggestions.map((s) => (
              <li key={s.service}>
                <span className="font-medium">{s.service}</span>
                <span className="text-amber-200/70"> — {s.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="text-[11px] text-zinc-600 font-mono">
        generated {new Date(brief.generatedAt).toLocaleString()} ·{" "}
        window {new Date(brief.weekStart).toLocaleDateString()} →{" "}
        {new Date(brief.weekEnd).toLocaleDateString()}
      </div>
    </div>
  );
}

function BriefStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "emerald" | "rose";
}) {
  const accentColor =
    accent === "emerald" ? "text-emerald-400" : accent === "rose" ? "text-rose-400" : "text-zinc-100";
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${accentColor}`}>{value}</div>
    </div>
  );
}
