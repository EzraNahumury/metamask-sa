"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock, FlaskConical, Github, Play, Radio, Sparkles } from "lucide-react";
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
import { formatMicroUsdc } from "../lib/format";
import type { AgentEvent, Decision, MerchantService } from "../lib/types";
import { useCountdown } from "../lib/useCountdown";
import { cn, formatError } from "../lib/utils";
import { DecisionRow } from "./DecisionRow";
import FridayBriefPanel from "./FridayBrief";
import OnboardingPanel from "./OnboardingPanel";
import { ServiceHealthStrip } from "./ServiceHealth";
import { AnimatedNumber } from "./ui/AnimatedNumber";
import { Aurora } from "./ui/Aurora";
import { GlassCard } from "./ui/GlassCard";
import { Logo } from "./ui/Logo";
import { PrimaryButton } from "./ui/PrimaryButton";
import { Sparkline } from "./ui/Sparkline";
import { StatusDot } from "./ui/StatusDot";

type ConnState = "connecting" | "live" | "offline";

const TICK_INTERVAL_SECONDS = 30;

export default function Dashboard() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [services, setServices] = useState<MerchantService[]>([]);
  const [conn, setConn] = useState<ConnState>("connecting");
  const [ticking, setTicking] = useState(false);
  const [armPending, setArmPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justArrived, setJustArrived] = useState<string | null>(null);
  const [lastTickAt, setLastTickAt] = useState<string | null>(null);
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
      } else if (ev.type === "tick.finished") {
        setLastTickAt(ev.at);
      }
    });
    return off;
  }, [conn, upsertDecision]);

  const countdown = useCountdown(lastTickAt, TICK_INTERVAL_SECONDS);

  const stats = useMemo(() => {
    const pays = decisions.filter((d) => d.action === "PAY");
    const refuses = decisions.filter((d) => d.action === "REFUSE");
    const spentMicro = pays.reduce<bigint>(
      (s, d) => s + BigInt(d.quotedMicroUsdc),
      BigInt(0),
    );
    const refusedMicro = refuses.reduce<bigint>(
      (s, d) => s + BigInt(d.quotedMicroUsdc),
      BigInt(0),
    );
    const spentSpark = pays.slice(0, 12).reverse().map((d) => Number(BigInt(d.quotedMicroUsdc)));
    const refusedSpark = refuses.slice(0, 12).reverse().map((d) =>
      Number(BigInt(d.quotedMicroUsdc)),
    );
    return {
      paidCount: pays.length,
      refusedCount: refuses.length,
      spentUsd: Number(spentMicro) / 1e6,
      refusedUsd: Number(refusedMicro) / 1e6,
      onchainCount: decisions.filter((d) => d.txHash).length,
      decisionCount: decisions.length,
      spentSpark,
      refusedSpark,
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
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8 sm:py-12 relative z-10">
        <NavBar conn={conn} countdown={countdown} />
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
                <span className="block mt-1 text-[11px] text-rose-300/70 font-mono">
                  agent {AGENT_URL} not reachable. Boot the stack and reload.
                </span>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <OnboardingPanel />

        <ServiceHealthStrip services={services} decisions={decisions} />

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

        <footer className="mt-14 mb-6 text-[11px] text-zinc-600 font-mono flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-center sm:justify-between border-t border-white/5 pt-5">
          <span>
            agent <span className="text-zinc-400">{AGENT_URL}</span>
            <span className="mx-2 text-zinc-700">·</span>
            merchants <span className="text-zinc-400">{MERCHANTS_URL}</span>
          </span>
          <span className="text-zinc-600 inline-flex items-center gap-2">
            <Radio className="h-3 w-3 text-emerald-400" /> Base mainnet · chain 8453
          </span>
        </footer>
      </div>
    </div>
  );
}

function NavBar({ conn, countdown }: { conn: ConnState; countdown: number }) {
  return (
    <nav className="flex items-center justify-between mb-8">
      <a href="/" className="inline-flex items-center gap-3 group">
        <Logo size="md" />
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight text-zinc-100">
            DeleGate<span className="text-grad">.AI</span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            chief of staff for onchain money
          </span>
        </span>
      </a>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02]">
          <Clock className="h-3 w-3" />
          next tick in{" "}
          <span className="text-zinc-300 tabular-nums">
            {conn === "live" ? `${countdown}s` : "—"}
          </span>
        </div>
        <StatusDot state={conn} />
        <a
          href="https://github.com/EzraNahumury/metamask-sa"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center justify-center h-9 w-9 rounded-xl border border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05] transition-colors"
          aria-label="source"
        >
          <Github className="h-4 w-4" />
        </a>
      </div>
    </nav>
  );
}

function Hero({ conn }: { conn: ConnState }) {
  return (
    <GlassCard variant="strong" className="relative overflow-hidden px-6 sm:px-10 py-10 sm:py-14 mb-8">
      <Aurora />
      <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-end">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-400"
          >
            <Sparkles className="h-3 w-3 text-emerald-300" />
            ERC-7702 · 7710 · 7715 · x402 · Venice
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.6 }}
            className="mt-4 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]"
          >
            Hire an agent.<br />
            <span className="text-grad">Keep the keys.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.6 }}
            className="mt-4 max-w-xl text-sm sm:text-base text-zinc-400 leading-relaxed"
          >
            DeleGate.AI pays your subscriptions, refuses anomalies, and ships a Friday Brief —
            all bounded by a single revocable MetaMask permission, settled in USDC on Base.
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.36, duration: 0.6 }}
          className="hidden md:block"
        >
          <Logo size="lg" />
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="relative mt-8 flex flex-wrap gap-4 text-[11px] text-zinc-500 font-mono"
      >
        <Marker label="status" value={conn} />
        <Marker label="chain" value="Base 8453" />
        <Marker label="relayer" value="1Shot public" />
        <Marker label="brain" value="Venice multimodal" />
      </motion.div>
    </GlassCard>
  );
}

function Marker({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-white/[0.05] bg-white/[0.02] px-2 py-1">
      <span className="text-zinc-600 uppercase tracking-[0.18em] text-[9px]">{label}</span>
      <span className="text-zinc-300">{value}</span>
    </span>
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
    decisionCount: number;
    spentSpark: number[];
    refusedSpark: number[];
  };
}) {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      <StatCard
        label="Paid"
        value={stats.paidCount}
        hint={`$${stats.spentUsd.toFixed(2)} routed to merchants`}
        accent="emerald"
        spark={stats.spentSpark}
      />
      <StatCard
        label="Refused"
        value={stats.refusedCount}
        hint={`$${stats.refusedUsd.toFixed(2)} blocked at the gate`}
        accent="rose"
        spark={stats.refusedSpark}
      />
      <StatCard
        label="Onchain txs"
        value={stats.onchainCount}
        hint="settled via 1Shot 7710 redemption"
        accent="sky"
      />
      <StatCard
        label="Decisions"
        value={stats.decisionCount}
        hint="reasoned by Venice this session"
      />
    </section>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent,
  spark,
}: {
  label: string;
  value: number;
  hint?: string;
  accent?: "emerald" | "rose" | "sky";
  spark?: number[];
}) {
  const tone =
    accent === "emerald"
      ? "text-emerald-300"
      : accent === "rose"
      ? "text-rose-300"
      : accent === "sky"
      ? "text-sky-300"
      : "text-zinc-100";
  const sparkColor =
    accent === "emerald" ? "#34d399" : accent === "rose" ? "#fb7185" : "#7dd3fc";
  return (
    <GlassCard hoverable className="px-4 py-4 group relative overflow-hidden">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
          <div
            className={cn(
              "mt-1 text-3xl font-semibold tracking-tight tabular-nums",
              tone,
            )}
          >
            <AnimatedNumber value={value} />
          </div>
        </div>
        {spark && spark.length > 0 ? (
          <div className="opacity-80 group-hover:opacity-100 transition-opacity">
            <Sparkline values={spark} color={sparkColor} width={70} height={24} />
          </div>
        ) : null}
      </div>
      {hint ? <div className="mt-2 text-[11px] text-zinc-500">{hint}</div> : null}
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
            Run a tick manually. Arm a 32× anomaly to demo the refusal moment.
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
        <span className="text-[11px] text-zinc-500 tabular-nums">
          {decisions.length} decisions · click a row to inspect the Venice round-trip
        </span>
      </div>
      <div className="hairline mb-4" />

      {conn === "offline" && decisions.length === 0 ? (
        <DecisionSkeleton count={3} />
      ) : decisions.length === 0 ? (
        <GlassCard className="px-6 py-12 text-center text-sm text-zinc-500">
          The first decision lands as soon as the loop ticks.{" "}
          <span className="text-zinc-300">Run tick now</span> to fast-forward.
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

formatMicroUsdc; // tree-shake guard — used by DecisionRow.
