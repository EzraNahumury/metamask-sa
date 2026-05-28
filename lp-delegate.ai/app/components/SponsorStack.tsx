"use client";

import { motion } from "framer-motion";

const PRIMITIVES = [
  { name: "MetaMask Smart Accounts", caption: "ERC-7702 upgrade in-flight" },
  { name: "ERC-7715 Advanced Permissions", caption: "Granted via MetaMask extension popup" },
  { name: "ERC-7710 Delegation", caption: "Every onchain action redeems a delegation" },
  { name: "EIP-6963 multi-wallet discovery", caption: "In-app picker, no wallet land grab" },
  { name: "1Shot permissionless relayer", caption: "Gas paid in USDC, no paymaster" },
  { name: "x402 v2 facilitator", caption: "Reusable module in packages/core" },
  { name: "Venice text · image · audio", caption: "Three endpoints, one Friday Brief" },
  { name: "Venice x402 (no API key)", caption: "EIP-3009 USDC pays for inference" },
];

const TICKER = [
  "BASE MAINNET",
  "CHAIN 8453",
  "ERC-7702",
  "ERC-7710",
  "ERC-7715",
  "EIP-6963",
  "x402 v2",
  "1SHOT PUBLIC RELAYER",
  "VENICE TEXT · IMAGE · AUDIO",
];

export function SponsorStack() {
  return (
    <section id="stack" className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 relative z-10">
        <div className="max-w-2xl">
          <span className="text-[10px] uppercase tracking-[0.22em] text-violet-300/80 font-mono">
            Every primitive earns its place
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight display">
            The stack, audited honestly.
          </h2>
          <p className="mt-4 text-[15px] text-zinc-400 leading-relaxed">
            Nothing in the table below is decoration. Each line maps to a real
            module in the repo — and is documented in{" "}
            <a
              href="https://github.com/EzraNahumury/metamask-sa/blob/main/SPIKE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-300 hover:text-emerald-200 underline underline-offset-4"
            >
              SPIKE.md
            </a>
            .
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRIMITIVES.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, x: -6 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: 0.03 * i, duration: 0.35 }}
              className="flex items-baseline justify-between gap-3 rounded-xl border border-white/[0.05] bg-white/[0.012] px-4 py-3 hover:bg-white/[0.03] hover:border-white/[0.1] transition-colors"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] text-zinc-100 font-medium tracking-tight truncate">
                  {p.name}
                </span>
                <span className="text-[11px] text-zinc-500 mt-0.5">
                  {p.caption}
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.22em] text-emerald-300/70 font-mono shrink-0">
                shipped
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative mt-16 border-y border-white/[0.05] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10"
          style={{
            background:
              "linear-gradient(90deg, rgb(var(--bg)) 0%, transparent 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10"
          style={{
            background:
              "linear-gradient(270deg, rgb(var(--bg)) 0%, transparent 100%)",
          }}
        />
        <div className="ticker gap-10 px-4 py-3 text-[11px] font-mono uppercase tracking-[0.22em] text-zinc-600">
          {[...TICKER, ...TICKER].map((s, i) => (
            <span key={i} className="inline-flex items-center gap-3 whitespace-nowrap">
              <span className="h-1 w-1 rounded-full bg-zinc-700" />
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
