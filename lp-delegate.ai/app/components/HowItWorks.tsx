"use client";

import { Brain, KeyRound, Sparkles } from "lucide-react";

const STEPS = [
  {
    icon: KeyRound,
    n: "01",
    title: "Sign one grant",
    body:
      "Connect MetaMask via our EIP-6963 picker, pick a weekly cap, and sign an ERC-7715 erc20-token-periodic permission. Caveats live onchain.",
  },
  {
    icon: Brain,
    n: "02",
    title: "Agent reasons + pays",
    body:
      "Every tick: GET /quote returns 402, Venice decides PAY · REFUSE · ESCALATE, the agent signs EIP-3009 over x402, and 1Shot relays the ERC-7710 redemption on Base.",
  },
  {
    icon: Sparkles,
    n: "03",
    title: "Read the Friday Brief",
    body:
      "One button. Three Venice endpoints. Text reasoning, a generated chart image, and a 60-second voice narration — delivered in a single response.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-24 sm:py-28 border-t border-[var(--border)]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
        <div className="max-w-xl">
          <span className="section-eyebrow">How it actually works</span>
          <h2 className="font-display mt-2 text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            Three steps, one signature.
          </h2>
        </div>
        <span className="text-[12px] text-[var(--text-tertiary)] font-mono">
          Base mainnet · 8453
        </span>
      </div>

      <ol className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <li key={s.n} className="card p-6 relative overflow-hidden">
              <div
                className="pointer-events-none absolute -top-12 -right-8 h-40 w-40 rounded-full"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(16,185,129,0.18), transparent 70%)",
                  filter: "blur(20px)",
                }}
              />
              <div className="relative flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white/[0.02]">
                  <Icon className="h-5 w-5 text-[var(--text-primary)]" />
                </span>
                <span className="section-eyebrow tabnum">step {s.n}</span>
              </div>
              <h3 className="relative mt-4 text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                {s.title}
              </h3>
              <p className="relative mt-2 text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
                {s.body}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
