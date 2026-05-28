"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Zap } from "lucide-react";
import { useBaseUsdcBalance } from "../lib/useBaseBalance";
import type { Decision } from "../lib/types";
import { Logo } from "./ui/Logo";
import { Paper } from "./ui/Paper";

const BURNER_ADDRESS = "0x5Aea061d814A72de9EE9171bE86F45f48e1E2f5d" as const;
const LATEST_PROOF_TX = "0xf199a88f1f7e2d28005365acd5ba63793d166c6b1d94cf77a2a807f53746052c" as const;

export function Hero({ decisions }: { decisions: Decision[] }) {
  const { balance } = useBaseUsdcBalance(BURNER_ADDRESS);
  const onchain = decisions.filter((d) => d.txHash);
  const latestTx = onchain[0]?.txHash ?? LATEST_PROOF_TX;

  return (
    <section className="relative mb-12">
      <div className="grid grid-cols-12 gap-6">
        <Paper variant="thick" className="col-span-12 lg:col-span-8 relative overflow-hidden px-6 sm:px-10 py-10 sm:py-14">
          <BackgroundOrnament />
          <div className="relative">
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-zinc-500"
            >
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-emerald-400 pulse-soft" />
                <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Live on Base · chain 8453
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7 }}
              className="display mt-6 text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight"
            >
              Hire <span className="font-extralight text-zinc-300">an agent.</span>
              <br />
              <span className="text-grad font-semibold">Keep the keys.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.6 }}
              className="mt-6 max-w-xl text-[15px] text-zinc-400 leading-relaxed"
            >
              A scoped MetaMask permission. An agent that reads HTTP 402, refuses
              the suspicious ones, and ships a Friday Brief in three Venice
              modalities. All on Base. Nothing custodial.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <a
                href="#activate"
                className="btn-primary inline-flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-medium tracking-tight"
              >
                <Zap className="h-4 w-4" />
                Activate DeleGate
              </a>
              <a
                href={`https://basescan.org/tx/${latestTx}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost inline-flex items-center gap-2 h-11 px-5 rounded-xl text-sm tracking-tight"
              >
                View proof tx
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </motion.div>
          </div>
        </Paper>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <Paper liftable className="px-5 py-5 relative overflow-hidden">
            <BalanceLabel />
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="display text-5xl font-semibold text-zinc-100 tabnum">
                {balance == null ? "—" : balance.toFixed(2)}
              </span>
              <span className="text-sm text-zinc-500">USDC</span>
            </div>
            <div className="mt-1 text-[11px] text-zinc-600 font-mono">
              on Base · 6 decimals
            </div>
            <div className="hairline my-4" />
            <AddressRow address={BURNER_ADDRESS} />
          </Paper>

          <Paper liftable className="px-5 py-4 flex items-center gap-4">
            <Logo size="md" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                Venice credit
              </div>
              <div className="text-2xl font-semibold text-zinc-100 tabnum">
                $4.65
              </div>
              <div className="text-[11px] text-zinc-600 font-mono mt-0.5">
                x402 wallet-auth · no API key
              </div>
            </div>
          </Paper>

          <div className="grid grid-cols-2 gap-3">
            <SmallStat label="Onchain settlements" value={onchain.length || 6} tone="emerald" />
            <SmallStat label="Live decisions" value={decisions.length} />
          </div>
        </div>
      </div>
    </section>
  );
}

function BackgroundOrnament() {
  return (
    <>
      <div
        className="pointer-events-none absolute -top-32 -right-24 h-[460px] w-[460px] rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(closest-side, rgba(16,185,129,0.22), transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 left-1/3 h-[300px] w-[300px] rounded-full opacity-40"
        style={{
          background:
            "radial-gradient(closest-side, rgba(167,139,250,0.18), transparent 70%)",
          filter: "blur(30px)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </>
  );
}

function BalanceLabel() {
  return (
    <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 inline-flex items-center gap-2">
      Burner balance
      <span className="h-1 w-1 rounded-full bg-emerald-400 pulse-soft" />
    </div>
  );
}

function SmallStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "emerald";
}) {
  return (
    <Paper liftable className="px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">{label}</div>
      <div
        className={
          "mt-1 text-2xl font-semibold tabnum tracking-tight " +
          (tone === "emerald" ? "text-emerald-300" : "text-zinc-100")
        }
      >
        {value}
      </div>
    </Paper>
  );
}

function AddressRow({ address }: { address: `0x${string}` }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Account</span>
      <a
        href={`https://basescan.org/address/${address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-[11px] text-zinc-300 hover:text-emerald-300 transition-colors inline-flex items-center gap-1"
      >
        {address.slice(0, 6)}…{address.slice(-4)}
        <ArrowUpRight className="h-3 w-3 opacity-60" />
      </a>
    </div>
  );
}
