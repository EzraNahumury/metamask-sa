"use client";

import { motion } from "framer-motion";
import {
  Brain,
  CircleDollarSign,
  Headphones,
  RadioTower,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { cn } from "../lib/cn";

type Feature = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  tone?: "emerald" | "sky" | "violet";
};

const FEATURES: Feature[] = [
  {
    icon: ShieldCheck,
    title: "Bounded by a single signature",
    body:
      "One ERC-7715 grant. Weekly cap, expiry, allowed callees — caveats run onchain and the agent literally cannot outspend them.",
    tone: "emerald",
  },
  {
    icon: Brain,
    title: "Real Venice reasoning",
    body:
      "Every invoice is read by a Venice text model with a strict JSON schema. PAY, REFUSE, or ESCALATE — never a hardcoded if-else.",
    tone: "sky",
  },
  {
    icon: CircleDollarSign,
    title: "Pays in USDC, not ETH",
    body:
      "The 1Shot permissionless relayer broadcasts every ERC-7710 redemption, takes its fee in USDC, and the user never holds a paymaster.",
  },
  {
    icon: RadioTower,
    title: "Refuses anomalies in real time",
    body:
      "A 32× quote inflation triggers a refuse on the same tick — Venice surfaces the reason, the dashboard streams it via SSE, the wallet stays untouched.",
    tone: "violet",
  },
  {
    icon: Workflow,
    title: "x402 native, no API keys",
    body:
      "The same wallet pays merchants and Venice. EIP-3009 transferWithAuthorization wrapped in the x402 v2 payload — no credit card, no account.",
    tone: "emerald",
  },
  {
    icon: Headphones,
    title: "Friday Brief, three modalities",
    body:
      "Text reasoning, a generated chart image, a 60-second voiceover. One Venice round-trip. Multi-endpoint by design, not by retrofit.",
    tone: "sky",
  },
];

export function Features() {
  return (
    <section id="how" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 relative z-10">
        <div className="max-w-2xl">
          <span className="text-[10px] uppercase tracking-[0.22em] text-emerald-300/80 font-mono">
            What the agent ships
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight display">
            Six things a custody wallet
            <br /> simply cannot do.
          </h2>
          <p className="mt-4 text-[15px] text-zinc-400 leading-relaxed">
            Every feature below is wired to a real primitive — there's no demo
            theatre. Click any of the basescan links further down to verify
            onchain.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} f={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ f, index }: { f: Feature; index: number }) {
  const Icon = f.icon;
  const tint =
    f.tone === "emerald"
      ? "from-emerald-500/[0.12] text-emerald-300 border-emerald-500/20"
      : f.tone === "sky"
      ? "from-sky-500/[0.10] text-sky-300 border-sky-500/20"
      : f.tone === "violet"
      ? "from-violet-500/[0.10] text-violet-300 border-violet-500/20"
      : "from-white/[0.04] text-zinc-300 border-white/[0.07]";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: 0.04 * index, duration: 0.4 }}
      className="glass rounded-2xl p-5 sm:p-6 relative overflow-hidden group"
    >
      <div
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br to-transparent border",
          tint,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight text-zinc-50">
        {f.title}
      </h3>
      <p className="mt-2 text-[13.5px] text-zinc-400 leading-relaxed">{f.body}</p>
    </motion.div>
  );
}
