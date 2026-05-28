"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

type Proof = {
  label: string;
  detail: string;
  tx: `0x${string}`;
  badge?: string;
};

const PROOFS: Proof[] = [
  {
    label: "First ERC-7702 upgrade + ERC-7710 redemption",
    detail:
      "Installed the EIP-7702 stateless delegator on the burner and paid 0.02 USDC to 1Shot's collector inside the same tx.",
    tx: "0xf199a88f1f7e2d28005365acd5ba63793d166c6b1d94cf77a2a807f53746052c",
    badge: "spike 07",
  },
  {
    label: "Netflix-mock dust settlement",
    detail: "Two USDC transfers batched: fee to 1Shot + 0.01 dust to recipient.",
    tx: "0x4f219452a2f531d482828b76411d641056ac04df41c31713ee44422f71072714",
  },
  {
    label: "Spotify-mock dust settlement",
    detail: "Live agent tick. Venice approved, 1Shot relayed.",
    tx: "0xbf3ad3ebd8b077ec7310500f79b0e04481d8df9b69bd4a594389567aaa458156",
  },
  {
    label: "Substack-mock dust settlement",
    detail: "Live agent tick. Venice approved, 1Shot relayed.",
    tx: "0xa7b180838fbb37976045e77daa421dfe224cafdbaa15384a1ed2e80816320fb0",
  },
  {
    label: "Domain-mock dust settlement",
    detail: "Live agent tick. Venice approved, 1Shot relayed.",
    tx: "0x4bbc81bd6385be4317ce905a7ec7ed4b2b5f5eef41e821f3d6f60a4a59085839",
  },
  {
    label: "ChatGPT-mock dust settlement",
    detail: "Live agent tick. Venice approved, 1Shot relayed.",
    tx: "0xdd5134d6126446d41fe723c6edf9c771be06c1a836d3fd1444782bfd4ecd833f",
  },
];

const BURNER = "0x5Aea061d814A72de9EE9171bE86F45f48e1E2f5d" as const;

export function OnchainProof() {
  return (
    <section id="proof" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="max-w-xl">
            <span className="text-[10px] uppercase tracking-[0.22em] text-emerald-300/80 font-mono">
              Verifiable now
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight display">
              Six transactions on Base.
              <br /> Inspect any of them.
            </h2>
            <p className="mt-4 text-[15px] text-zinc-400 leading-relaxed">
              Real ERC-7710 redemptions broadcast by the public 1Shot relayer on
              behalf of the burner smart account below. Click through to
              basescan and read the calldata.
            </p>
          </div>
          <a
            href={`https://basescan.org/address/${BURNER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] font-mono text-zinc-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1.5"
          >
            burner {BURNER.slice(0, 6)}…{BURNER.slice(-4)}
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {PROOFS.map((p, i) => (
            <ProofRow key={p.tx} p={p} index={i} />
          ))}
        </div>

        <div className="mt-8 text-[11px] text-zinc-600 font-mono leading-relaxed">
          Each settlement contains <span className="text-zinc-300">two</span>{" "}
          USDC transfers inside one ERC-7710 redemption: the relayer fee to
          1Shot's collector, and the dust transfer to the merchant. No
          paymaster, no ETH, no API keys.
        </div>
      </div>
    </section>
  );
}

function ProofRow({ p, index }: { p: Proof; index: number }) {
  return (
    <motion.a
      href={`https://basescan.org/tx/${p.tx}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: 0.04 * index, duration: 0.35 }}
      className="group relative rounded-2xl border border-white/[0.05] bg-white/[0.012] hover:bg-white/[0.03] hover:border-white/[0.1] transition-colors overflow-hidden block"
    >
      <div className="absolute top-0 left-0 h-full w-[3px] bg-gradient-to-b from-emerald-400 to-emerald-600 opacity-80" />
      <div className="px-5 py-4 pl-7">
        <div className="flex items-baseline justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[14px] font-medium text-zinc-100 tracking-tight truncate">
              {p.label}
            </span>
            {p.badge ? (
              <span className="text-[9px] uppercase tracking-[0.22em] text-emerald-300/80 border border-emerald-500/30 bg-emerald-500/10 rounded-full px-1.5 py-[1px] font-mono">
                {p.badge}
              </span>
            ) : null}
          </div>
          <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-emerald-300 transition-colors shrink-0" />
        </div>
        <div className="mt-1 text-[12.5px] text-zinc-400 leading-snug">{p.detail}</div>
        <div className="mt-2 text-[11px] font-mono text-zinc-600 break-all">
          {p.tx}
        </div>
      </div>
    </motion.a>
  );
}
