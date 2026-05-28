"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock, FlaskConical, Github, Play, Radio } from "lucide-react";
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
import type { AgentEvent, Decision, MerchantService } from "../lib/types";
import { useCountdown } from "../lib/useCountdown";
import { cn, formatError } from "../lib/utils";
import { DecisionRow } from "./DecisionRow";
import FridayBriefPanel from "./FridayBrief";
import { Hero } from "./Hero";
import OnboardingPanel from "./OnboardingPanel";
import { ServiceHealthStrip } from "./ServiceHealth";
import { Btn } from "./ui/Btn";
import { Logo } from "./ui/Logo";
import { Marquee } from "./ui/Marquee";
import { Paper } from "./ui/Paper";
import { StatusDot } from "./ui/StatusDot";

type ConnState = "connecting" | "live" | "offline";
const TICK_INTERVAL_SECONDS = 30;

const SYSTEM_TICKER_ITEMS = [
  "BASE MAINNET",
  "CHAIN 8453",
  "ERC-7702 STATELESS DELEGATOR",
  "ERC-7710 REDEMPTION",
  "ERC-7715 ADVANCED PERMISSION",
  "1SHOT PUBLIC RELAYER",
  "VENICE TEXT · IMAGE · AUDIO",
  "x402 v2",
];

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
      setTimeout(() => setJustArrived((cur) => (cur === d.id ? null : cur)), 1100);
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

  const totalSpend = useMemo(() => {
    return decisions
      .filter((d) => d.action === "PAY")
      .reduce<number>((sum, d) => sum + Number(BigInt(d.quotedMicroUsdc)) / 1e6, 0);
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
      <NavBar conn={conn} countdown={countdown} totalSpend={totalSpend} />

      <Marquee
        items={SYSTEM_TICKER_ITEMS.map((s, i) => (
          <span key={i}>{s}</span>
        ))}
        className="border-y border-white/[0.04] mb-10"
      />

      <main className="mx-auto max-w-6xl px-5 sm:px-8 relative z-10">
        <Hero decisions={decisions} />

        <AnimatePresence>
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 rounded-xl border border-rose-700/40 bg-rose-950/30 px-4 py-3 text-sm text-rose-200 backdrop-blur"
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

        <section id="activate" className="mb-12">
          <SectionHeader index="01" title="Activate" caption="Connect, set the cap, sign once." />
          <OnboardingPanel />
        </section>

        <section className="mb-12">
          <SectionHeader index="02" title="Subscriptions" caption="Five mock services priced over x402." />
          <ServiceHealthStrip services={services} decisions={decisions} />
        </section>

        <section className="mb-12">
          <SectionHeader
            index="03"
            title="Demo controls"
            caption="Manual tick. Or arm a 32× anomaly to see the agent refuse."
          />
          <Paper className="px-5 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <FlaskConical className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <div className="text-sm text-zinc-200 font-medium">Stage the loop</div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  Real Venice round-trips. Real x402 quotes. Real 1Shot redemption when settlement is on.
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Btn onClick={onTick} loading={ticking} disabled={conn !== "live"} size="sm">
                <Play className="h-3.5 w-3.5" />
                Run tick
              </Btn>
              {services.map((s) => (
                <Btn
                  key={s.slug}
                  variant="danger"
                  size="sm"
                  onClick={() => onArm(s.slug)}
                  loading={armPending === s.slug}
                  disabled={conn !== "live"}
                  title={`Set the next /quote for ${s.slug} to 32× normal`}
                >
                  arm {s.slug.replace("-mock", "")}
                </Btn>
              ))}
            </div>
          </Paper>
        </section>

        <section className="mb-12">
          <SectionHeader
            index="04"
            title="Friday Brief"
            caption="Three Venice endpoints in one call — text · image · audio."
          />
          <FridayBriefPanel />
        </section>

        <section className="mb-16">
          <SectionHeader
            index="05"
            title="Live decision feed"
            caption="Every PAY · REFUSE · ESCALATE the agent fires, in real time."
            right={
              <span className="text-[11px] text-zinc-500 font-mono">
                click a row to read the Venice round-trip
              </span>
            }
          />

          {conn === "offline" && decisions.length === 0 ? (
            <DecisionSkeleton count={3} />
          ) : decisions.length === 0 ? (
            <Paper className="px-6 py-12 text-center text-sm text-zinc-500">
              The first decision lands as soon as the loop ticks.{" "}
              <span className="text-zinc-300">Run tick</span> to fast-forward.
            </Paper>
          ) : (
            <motion.ol layout className="flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {decisions.map((d, i) => (
                  <DecisionRow
                    key={d.id}
                    d={d}
                    index={i}
                    highlight={justArrived === d.id}
                  />
                ))}
              </AnimatePresence>
            </motion.ol>
          )}
        </section>

        <footer className="mb-10 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-[11px] text-zinc-600 font-mono">
          <span>
            agent <span className="text-zinc-400">{AGENT_URL}</span>
            <span className="mx-2 text-zinc-800">·</span>
            merchants <span className="text-zinc-400">{MERCHANTS_URL}</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <Radio className="h-3 w-3 text-emerald-400" /> Base mainnet · 8453
          </span>
        </footer>
      </main>
    </div>
  );
}

function NavBar({
  conn,
  countdown,
  totalSpend,
}: {
  conn: ConnState;
  countdown: number;
  totalSpend: number;
}) {
  return (
    <header className="relative z-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-6 pb-5 flex items-center justify-between">
        <a href="/" className="inline-flex items-center gap-3 group">
          <Logo size="md" />
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight text-zinc-100">
              DeleGate<span className="text-grad">.AI</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              chief of staff for onchain money
            </span>
          </span>
        </a>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono px-3 py-1.5 rounded-full border border-white/[0.05] bg-white/[0.015]">
            <span className="text-zinc-600">spend</span>
            <span className="text-zinc-300 tabnum">${totalSpend.toFixed(2)}</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono px-3 py-1.5 rounded-full border border-white/[0.05] bg-white/[0.015]">
            <Clock className="h-3 w-3" />
            next tick <span className="text-zinc-300 tabnum">{conn === "live" ? `${countdown}s` : "—"}</span>
          </span>
          <StatusDot state={conn} />
          <a
            href="https://github.com/EzraNahumury/metamask-sa"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center justify-center h-9 w-9 rounded-xl border border-white/[0.05] bg-white/[0.015] text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] transition-colors"
            aria-label="source"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}

function SectionHeader({
  index,
  title,
  caption,
  right,
}: {
  index: string;
  title: string;
  caption?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[11px] text-zinc-600 tabnum">{index}</span>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-100">
          {title}
        </h2>
        {caption ? (
          <span className="hidden sm:inline text-[12px] text-zinc-500">— {caption}</span>
        ) : null}
      </div>
      {right ? <div>{right}</div> : null}
    </div>
  );
}

function DecisionSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-white/[0.04] bg-white/[0.012] h-[68px] loading-stripe" />
      ))}
    </div>
  );
}

// Tree-shake guard: keep cn alive even if no inline use here right now.
cn;
