"use client";

import { motion } from "framer-motion";
import { Brain, KeyRound, Sparkles } from "lucide-react";

const STEPS = [
  {
    icon: KeyRound,
    n: "01",
    title: "Sign one grant",
    body:
      "Connect MetaMask via our EIP-6963 picker, pick a weekly cap, and sign an ERC-7715 erc20-token-periodic permission. The caveats live onchain.",
    accent: "from-emerald-400/30",
  },
  {
    icon: Brain,
    n: "02",
    title: "Agent reasons + pays",
    body:
      "Every tick: GET /quote returns 402, Venice decides PAY · REFUSE · ESCALATE, the agent signs EIP-3009 over x402, and 1Shot relays the ERC-7710 redemption on Base.",
    accent: "from-sky-400/30",
  },
  {
    icon: Sparkles,
    n: "03",
    title: "Read the Friday Brief",
    body:
      "One button. Three Venice endpoints. Text reasoning, a generated chart image, and a 60-second voice narration — all delivered in a single response.",
    accent: "from-violet-400/30",
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-24 sm:py-32 section-rule">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div className="max-w-xl">
            <span className="text-[10px] uppercase tracking-[0.22em] text-sky-300/80 font-mono">
              How it actually works
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight display">
              Three steps, one signature.
            </h2>
          </div>
          <span className="text-[12px] text-zinc-500 font-mono">
            Base mainnet · 8453
          </span>
        </div>

        <ol className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
          {STEPS.map((s, i) => (
            <StepCard key={s.n} s={s} index={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function StepCard({
  s,
  index,
}: {
  s: (typeof STEPS)[number];
  index: number;
}) {
  const Icon = s.icon;
  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: 0.06 * index, duration: 0.45 }}
      className="relative glass rounded-2xl p-6 overflow-hidden"
    >
      <div
        className={`pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-gradient-to-br ${s.accent} to-transparent opacity-70 blur-2xl`}
      />
      <div className="relative flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02]">
          <Icon className="h-4.5 w-4.5 text-zinc-200" />
        </span>
        <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono tabnum">
          step {s.n}
        </span>
      </div>
      <h3 className="relative mt-4 text-xl font-semibold tracking-tight text-zinc-50">
        {s.title}
      </h3>
      <p className="relative mt-2 text-[13.5px] text-zinc-400 leading-relaxed">
        {s.body}
      </p>
    </motion.li>
  );
}
