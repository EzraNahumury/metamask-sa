"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ExternalLink, FlaskConical, Play, Receipt, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AGENT_URL,
  MERCHANTS_URL,
  armAnomaly,
  fetchDecisions,
  fetchServices,
  subscribeAgentEvents,
  triggerTick,
} from "../lib/agent-client";
import { formatMicroUsdc, formatTime } from "../lib/format";
import type { AgentEvent, Decision, MerchantService } from "../lib/types";
import { cn, formatError } from "../lib/utils";
import FridayBriefPanel from "./FridayBrief";
import OnboardingPanel from "./OnboardingPanel";
import { AnimatedNumber } from "./ui/AnimatedNumber";
import { Aurora } from "./ui/Aurora";
import { GlassCard } from "./ui/GlassCard";
import { PrimaryButton } from "./ui/PrimaryButton";
import { StatusDot } from "./ui/StatusDot";

type ConnState = "connecting" | "live" | "offline";

export default function Dashboard() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [services, setServices] = useState<MerchantService[]>([]);
  const [conn, setConn] = useState<ConnState>("connecting");
  const [ticking, setTicking] = useState(false);
  const [armPending, setArmPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justArrived, setJustArrived] = useState<string | null>(null);
  const decisionMap = useRef(new Map<string, Decision>());

  const upsertDecision = useCallback((d: Decision, mark = false) => {
    decisionMap.current.set(d.id, d);
    setDecisions(
      Array.from(decisionMap.current.values()).sort((a, b) =>
        b.decidedAt.localeCompare(a.decidedAt),
      ),
    );
    if (mark) {
      setJustArrived(d.id);
      setTimeout(() => setJustArrived((cur) => (cur === d.id ? null : cur)), 1200);
    }
  }, []);

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
        setError(formatError(e));
        setConn("offline");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (conn !== "live") return;
    const off = subscribeAgentEvents((ev: AgentEvent) => {
      if (ev.type === "decision.recorded") {
        upsertDecision(ev.decision, true);
      } else if (ev.type === "payment.succeeded") {
        const existing = decisionMap.current.get(ev.decisionId);
        if (existing) upsertDecision({ ...existing, receiptId: ev.receiptId });
      } else if (ev.type === "payment.settled") {
        const existing = decisionMap.current.get(ev.decisionId);
        if (existing) upsertDecision({ ...existing, txHash: ev.txHash });
      }
    });
    return off;
  }, [conn, upsertDecision]);

  const stats = useMemo(() => {
    const pays = decisions.filter((d) => d.action === "PAY");
    const refuses = decisions.filter((d) => d.action === "REFUSE");
    const spentMicro = pays.reduce<bigint>((s, d) => s + BigInt(d.quotedMicroUsdc), BigInt(0));
    const refusedMicro = refuses.reduce<bigint>((s, d) => s + BigInt(d.quotedMicroUsdc), BigInt(0));
    return {
      paidCount: pays.length,
      refusedCount: refuses.length,
      spentUsd: Number(spentMicro) / 1e6,
      refusedUsd: Number(refusedMicro) / 1e6,
      onchainCount: decisions.filter((d) => d.txHash).length,
    };
  }, [decisions]);

  const onTick = async () => {
    setTicking(true);
    setError(null);
    try {
      await triggerTick();
    } catch (e) {
      setError(formatError(e));
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
      setError(formatError(e));
    } finally {
      setArmPending(null);
    }
  };

  return (
    <div className="relative min-h-screen text-zinc-100">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 sm:py-14 relative z-10">
        <Hero conn={conn} />

        <AnimatePresence>
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 rounded-xl border border-rose-700/50 bg-rose-950/30 px-4 py-3 text-sm text-rose-200 backdrop-blur"
            >
              {error}
              {conn === "offline" ? (
                <span className="block mt-1 text-[11px] text-rose-300/70">
                  agent {AGENT_URL} / merchants {MERCHANTS_URL} not reachable. Start the stack and
                  reload.
                </span>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <OnboardingPanel />

        <StatGrid stats={stats} />

        <DemoControls
          services={services}
          ticking={ticking}
          armPending={armPending}
          disabled={conn !== "live"}
          onTick={onTick}
          onArm={onArm}
        />

        <FridayBriefPanel />

        <DecisionFeed decisions={decisions} justArrived={justArrived} conn={conn} />

        <footer className="mt-14 text-[11px] text-zinc-600 font-mono flex items-center justify-between border-t border-white/5 pt-4">
          <span>
            agent <span className="text-zinc-400">{AGENT_URL}</span>
            <span className="mx-2 text-zinc-700">·</span>
            merchants <span className="text-zinc-400">{MERCHANTS_URL}</span>
          </span>
          <span className="text-zinc-700">Base mainnet · chain 8453</span>
        </footer>
      </div>
    </div>
  );
}

function Hero({ conn }: { conn: ConnState }) {
  return (
    <GlassCard variant="strong" className="relative overflow-hidden px-6 sm:px-10 py-10 sm:py-14 mb-10">
      <Aurora />
      <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-400"
          >
            <Sparkles className="h-3 w-3 text-emerald-300" />
            ERC-7702 · ERC-7710 · ERC-7715 · x402 · Venice
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.6 }}
            className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight"
          >
            DeleGate<span className="text-grad">.AI</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.6 }}
            className="mt-3 max-w-lg text-sm sm:text-base text-zinc-400 leading-relaxed"
          >
            Your AI chief of staff for onchain money — bounded, revocable, multimodal. Runs on Base
            via MetaMask Smart Accounts, paid through x402.
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-start sm:items-end gap-2"
        >
          <StatusDot state={conn} />
          <span className="text-[11px] text-zinc-600 font-mono">
            settles via <span className="text-zinc-400">1Shot relayer</span>
          </span>
        </motion.div>
      </div>
    </GlassCard>
  );
}

function StatGrid({
  stats,
}: {
  stats: {
    paidCount: number;
    refusedCount: number;
    spentUsd: number;
    refusedUsd: number;
    onchainCount: number;
  };
}) {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      <StatCard label="Paid" value={stats.paidCount} hint={`$${stats.spentUsd.toFixed(2)} total`} accent="emerald" />
      <StatCard label="Refused" value={stats.refusedCount} hint={`$${stats.refusedUsd.toFixed(2)} blocked`} accent="rose" />
      <StatCard label="Onchain txs" value={stats.onchainCount} hint="settled via 1Shot" accent="sky" />
      <StatCard label="Decisions" value={stats.paidCount + stats.refusedCount} hint="this session" />
    </section>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number;
  hint?: string;
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
    <GlassCard hoverable className="px-4 py-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className={cn("mt-1 text-3xl font-semibold tracking-tight tabular-nums", tone)}>
        <AnimatedNumber value={value} />
      </div>
      {hint ? <div className="mt-1 text-[11px] text-zinc-500">{hint}</div> : null}
    </GlassCard>
  );
}

function DemoControls({
  services,
  ticking,
  armPending,
  disabled,
  onTick,
  onArm,
}: {
  services: MerchantService[];
  ticking: boolean;
  armPending: string | null;
  disabled: boolean;
  onTick: () => void;
  onArm: (slug: string) => void;
}) {
  return (
    <GlassCard className="mb-8 px-5 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <FlaskConical className="h-5 w-5 text-emerald-300" />
        </div>
        <div>
          <h2 className="text-sm font-medium text-zinc-200">Demo controls</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Trigger a tick manually, or arm a 32× anomaly to demo the refusal moment.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <PrimaryButton onClick={onTick} loading={ticking} disabled={disabled} size="sm">
          <Play className="h-3.5 w-3.5" />
          Run tick now
        </PrimaryButton>
        {services.map((s) => (
          <PrimaryButton
            key={s.slug}
            variant="danger"
            size="sm"
            onClick={() => onArm(s.slug)}
            loading={armPending === s.slug}
            disabled={disabled}
            title={`Set the next /quote for ${s.slug} to 32× normal`}
          >
            arm {s.slug.replace("-mock", "")}
          </PrimaryButton>
        ))}
      </div>
    </GlassCard>
  );
}

function DecisionFeed({
  decisions,
  justArrived,
  conn,
}: {
  decisions: Decision[];
  justArrived: string | null;
  conn: ConnState;
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm font-medium text-zinc-200 inline-flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 pulse-soft" />
          Live decision feed
        </h2>
        <span className="text-xs text-zinc-500">{decisions.length} total</span>
      </div>
      <div className="hairline mb-4" />

      {conn === "offline" && decisions.length === 0 ? (
        <DecisionSkeleton count={3} />
      ) : decisions.length === 0 ? (
        <GlassCard className="px-6 py-10 text-center text-sm text-zinc-500">
          Waiting for first decision. Hit <span className="text-zinc-300">Run tick now</span> or wait
          for the background loop.
        </GlassCard>
      ) : (
        <motion.ol layout className="flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {decisions.map((d) => (
              <DecisionRow key={d.id} d={d} highlight={justArrived === d.id} />
            ))}
          </AnimatePresence>
        </motion.ol>
      )}
    </section>
  );
}

function DecisionSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <GlassCard key={i} className="px-4 py-4">
          <div className="skeleton h-3 w-1/3 rounded mb-3" />
          <div className="skeleton h-3 w-2/3 rounded" />
        </GlassCard>
      ))}
    </div>
  );
}

function DecisionRow({ d, highlight }: { d: Decision; highlight: boolean }) {
  const isPay = d.action === "PAY";
  const isRefuse = d.action === "REFUSE";
  const tone = isPay
    ? "border-emerald-500/25 from-emerald-500/[0.06]"
    : isRefuse
    ? "border-rose-500/25 from-rose-500/[0.06]"
    : "border-amber-500/25 from-amber-500/[0.06]";
  const tagColor = isPay ? "text-emerald-300" : isRefuse ? "text-rose-300" : "text-amber-300";

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
      className={cn(
        "relative rounded-xl border bg-gradient-to-b to-transparent px-4 py-3.5 backdrop-blur",
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
              "pointer-events-none absolute inset-0 rounded-xl",
              isPay ? "bg-emerald-500/15" : isRefuse ? "bg-rose-500/15" : "bg-amber-500/15",
            )}
          />
        ) : null}
      </AnimatePresence>
      <div className="relative flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={cn(
              "text-[10px] font-mono uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-md border",
              isPay
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : isRefuse
                ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                : "border-amber-500/40 bg-amber-500/10 text-amber-300",
            )}
          >
            {d.action}
          </span>
          <span className="text-sm font-medium text-zinc-100 truncate">{d.service}</span>
          <span className={cn("text-xs whitespace-nowrap text-zinc-400 tabular-nums", tagColor)}>
            {formatMicroUsdc(d.quotedMicroUsdc)}
          </span>
        </div>
        <span className="text-[11px] text-zinc-500 whitespace-nowrap tabular-nums">
          {formatTime(d.decidedAt)} · conf {d.confidence.toFixed(2)}
        </span>
      </div>
      <div className="relative text-sm text-zinc-300 mt-1.5 leading-relaxed">{d.reason}</div>
      {d.receiptId || d.txHash ? (
        <div className="relative mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-500 font-mono items-center">
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
              className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 transition-colors"
            >
              <ExternalLink className="h-3 w-3" /> {d.txHash.slice(0, 12)}…
              <ArrowRight className="h-3 w-3 opacity-60" />
            </a>
          ) : null}
        </div>
      ) : null}
    </motion.li>
  );
}
