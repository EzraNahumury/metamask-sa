"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  armAnomaly,
  fetchDecisions,
  fetchServices,
  subscribeAgentEvents,
  triggerTick,
} from "../lib/agent-client";
import { formatMicroUsdc, formatTime } from "../lib/format";
import type { AgentEvent, Decision, MerchantService } from "../lib/types";

type ConnState = "connecting" | "live" | "offline";

export default function Dashboard() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [services, setServices] = useState<MerchantService[]>([]);
  const [conn, setConn] = useState<ConnState>("connecting");
  const [ticking, setTicking] = useState(false);
  const [armPending, setArmPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const decisionMap = useRef(new Map<string, Decision>());

  const upsertDecision = useCallback((d: Decision) => {
    decisionMap.current.set(d.id, d);
    setDecisions(
      Array.from(decisionMap.current.values()).sort((a, b) =>
        b.decidedAt.localeCompare(a.decidedAt),
      ),
    );
  }, []);

  // Bootstrap.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [ds, svcs] = await Promise.all([fetchDecisions(), fetchServices()]);
        if (cancelled) return;
        decisionMap.current = new Map(ds.map((d) => [d.id, d]));
        setDecisions([...ds].sort((a, b) => b.decidedAt.localeCompare(a.decidedAt)));
        setServices(svcs);
        setConn("live");
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setConn("offline");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // SSE subscribe.
  useEffect(() => {
    const off = subscribeAgentEvents((ev: AgentEvent) => {
      if (ev.type === "decision.recorded") {
        upsertDecision(ev.decision);
      } else if (ev.type === "payment.succeeded") {
        const existing = decisionMap.current.get(ev.decisionId);
        if (existing) upsertDecision({ ...existing, receiptId: ev.receiptId });
      }
    });
    return off;
  }, [upsertDecision]);

  const stats = useMemo(() => {
    const todays = decisions;
    const pays = todays.filter((d) => d.action === "PAY");
    const refuses = todays.filter((d) => d.action === "REFUSE");
    const spentMicro = pays.reduce<bigint>((sum, d) => sum + BigInt(d.quotedMicroUsdc), BigInt(0));
    const refusedMicro = refuses.reduce<bigint>(
      (sum, d) => sum + BigInt(d.quotedMicroUsdc),
      BigInt(0),
    );
    return {
      paidCount: pays.length,
      refusedCount: refuses.length,
      spent: formatMicroUsdc(spentMicro),
      refused: formatMicroUsdc(refusedMicro),
    };
  }, [decisions]);

  const onTick = async () => {
    setTicking(true);
    setError(null);
    try {
      await triggerTick();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setTicking(false);
    }
  };

  const onArm = async (slug: string) => {
    setArmPending(slug);
    setError(null);
    try {
      await armAnomaly(slug);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setArmPending(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 sm:p-10 font-sans">
      <header className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6 mb-10 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            DeleGate<span className="text-emerald-400">.AI</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1 max-w-md">
            Bounded, revocable, multimodal — your AI chief of staff for onchain
            money on Base.
          </p>
        </div>
        <div className="sm:ml-auto flex items-center gap-2 text-xs uppercase tracking-wider">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              conn === "live"
                ? "bg-emerald-400 animate-pulse"
                : conn === "connecting"
                ? "bg-amber-400"
                : "bg-rose-500"
            }`}
          />
          <span className="text-zinc-400">agent {conn}</span>
        </div>
      </header>

      {error ? (
        <div className="mb-6 rounded-lg border border-rose-800/60 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <StatCard label="Paid this session" value={String(stats.paidCount)} hint={stats.spent} accent="emerald" />
        <StatCard label="Refused" value={String(stats.refusedCount)} hint={stats.refused} accent="rose" />
        <StatCard label="Services" value={String(services.length)} hint="x402-quoted" />
        <StatCard label="Decisions" value={String(decisions.length)} hint="this session" />
      </section>

      <section className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border border-zinc-800 rounded-xl p-4 bg-zinc-900/40">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
            Demo controls
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Trigger a tick manually or arm an anomaly — useful for live recording.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onTick}
            disabled={ticking || conn !== "live"}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-emerald-950 text-sm font-medium hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {ticking ? "Ticking…" : "Run tick now"}
          </button>
          {services.map((s) => (
            <button
              key={s.slug}
              onClick={() => onArm(s.slug)}
              disabled={armPending === s.slug || conn !== "live"}
              className="px-3 py-2 rounded-lg border border-rose-800/60 bg-rose-950/30 text-rose-200 text-xs hover:bg-rose-900/40 disabled:opacity-40 transition"
              title={`Set the next /quote for ${s.slug} to 32x normal`}
            >
              {armPending === s.slug ? "arming…" : `Arm ${s.slug}`}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
            Live decision feed
          </h2>
          <span className="text-xs text-zinc-500">{decisions.length} total</span>
        </div>
        {decisions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 px-6 py-12 text-center text-zinc-500">
            Waiting for first decision. Hit{" "}
            <span className="text-zinc-300">Run tick now</span> or wait for the
            background loop.
          </div>
        ) : (
          <ol className="flex flex-col gap-2">
            {decisions.map((d) => (
              <DecisionRow key={d.id} d={d} />
            ))}
          </ol>
        )}
      </section>

      <footer className="mt-12 text-xs text-zinc-600 border-t border-zinc-900 pt-4">
        agent={process.env.NEXT_PUBLIC_AGENT_URL ?? "http://localhost:4030"}{" "}
        ·{" "}
        merchants={process.env.NEXT_PUBLIC_MERCHANTS_URL ?? "http://localhost:4021"}
      </footer>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "emerald" | "rose";
}) {
  const accentColor =
    accent === "emerald"
      ? "text-emerald-400"
      : accent === "rose"
      ? "text-rose-400"
      : "text-zinc-100";
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${accentColor}`}>{value}</div>
      {hint ? <div className="text-xs text-zinc-500 mt-0.5">{hint}</div> : null}
    </div>
  );
}

function DecisionRow({ d }: { d: Decision }) {
  const isPay = d.action === "PAY";
  const isRefuse = d.action === "REFUSE";
  const color = isPay
    ? "border-emerald-700/60 bg-emerald-950/30"
    : isRefuse
    ? "border-rose-800/60 bg-rose-950/30"
    : "border-amber-700/60 bg-amber-950/30";
  const tagColor = isPay
    ? "text-emerald-300"
    : isRefuse
    ? "text-rose-300"
    : "text-amber-300";

  return (
    <li className={`rounded-xl border ${color} px-4 py-3 flex flex-col gap-2`}>
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`text-xs font-mono uppercase tracking-wider ${tagColor}`}>
            {d.action}
          </span>
          <span className="text-sm font-medium text-zinc-100 truncate">{d.service}</span>
          <span className="text-xs text-zinc-500 whitespace-nowrap">
            {formatMicroUsdc(d.quotedMicroUsdc)}
          </span>
        </div>
        <span className="text-[11px] text-zinc-500 whitespace-nowrap">
          {formatTime(d.decidedAt)} · conf {d.confidence.toFixed(2)}
        </span>
      </div>
      <div className="text-sm text-zinc-300">{d.reason}</div>
      {d.receiptId ? (
        <div className="text-[11px] text-zinc-500 font-mono">
          receipt {d.receiptId}
        </div>
      ) : null}
    </li>
  );
}
