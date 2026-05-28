"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Zap } from "lucide-react";

const BASESCAN_PROOF =
  "https://basescan.org/tx/0xf199a88f1f7e2d28005365acd5ba63793d166c6b1d94cf77a2a807f53746052c";

export function Hero() {
  return (
    <section id="top" className="relative pt-36 pb-24 sm:pt-44 sm:pb-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-zinc-500"
        >
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-emerald-400 pulse-soft" />
            <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Live on Base mainnet · chain 8453
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.7 }}
          className="display mt-6 text-5xl sm:text-7xl md:text-[88px] font-semibold tracking-tight"
        >
          Hire <span className="font-extralight text-zinc-300">an agent.</span>
          <br />
          <span className="text-grad">Keep the keys.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.6 }}
          className="mt-7 max-w-2xl text-[15px] sm:text-base text-zinc-400 leading-relaxed"
        >
          DeleGate.AI is a scoped MetaMask permission and an autonomous
          reasoning agent. It pays your subscriptions over x402, refuses
          suspicious quotes in real time, and ships a Friday Brief in three
          Venice modalities. All on Base. Nothing custodial.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.36 }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <a
            id="launch"
            href="http://localhost:3000"
            className="btn-primary inline-flex items-center gap-2 h-12 px-6 rounded-xl text-[15px] font-medium tracking-tight"
          >
            <Zap className="h-4 w-4" />
            Launch dashboard
          </a>
          <a
            href={BASESCAN_PROOF}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost inline-flex items-center gap-2 h-12 px-5 rounded-xl text-[14px] tracking-tight"
          >
            View proof tx
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-14 grid grid-cols-3 sm:grid-cols-4 gap-4 max-w-3xl"
        >
          {[
            { k: "Tracks targeted", v: "4 / 5" },
            { k: "Onchain settlements", v: "6" },
            { k: "Venice endpoints", v: "3" },
            { k: "Sponsor primitives", v: "9" },
          ].map((s) => (
            <div key={s.k}>
              <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                {s.k}
              </div>
              <div className="mt-1 text-2xl sm:text-3xl font-semibold text-zinc-50 tabnum tracking-tight">
                {s.v}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
