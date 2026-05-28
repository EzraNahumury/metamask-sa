"use client";

const PRIMITIVES = [
  { name: "MetaMask Smart Accounts", caption: "ERC-7702 upgrade in-flight" },
  { name: "ERC-7715 Advanced Permissions", caption: "MetaMask extension popup" },
  { name: "ERC-7710 Delegation", caption: "Every onchain action redeems one" },
  { name: "EIP-6963 multi-wallet discovery", caption: "In-app picker" },
  { name: "1Shot permissionless relayer", caption: "Gas paid in USDC" },
  { name: "x402 v2 facilitator", caption: "Reusable in packages/core" },
  { name: "Venice text · image · audio", caption: "Three endpoints, one brief" },
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
    <section id="stack" className="relative py-24 sm:py-28 border-t border-[var(--border)]">
      <div className="max-w-2xl">
        <span className="section-eyebrow">Every primitive earns its place</span>
        <h2 className="font-display mt-2 text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
          The stack, audited honestly.
        </h2>
        <p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-relaxed">
          Nothing in the table below is decoration. Each line maps to a real
          module in the repo — documented in{" "}
          <a
            href="https://github.com/EzraNahumury/metamask-sa/blob/main/SPIKE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent-light)] hover:text-[var(--accent)] underline underline-offset-4"
          >
            SPIKE.md
          </a>
          .
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PRIMITIVES.map((p) => (
          <div
            key={p.name}
            className="card flex items-baseline justify-between gap-3 px-4 py-3"
          >
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] text-[var(--text-primary)] font-medium tracking-tight truncate">
                {p.name}
              </span>
              <span className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                {p.caption}
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--accent-light)] font-mono shrink-0">
              shipped
            </span>
          </div>
        ))}
      </div>

      <div className="relative mt-16 border-y border-[var(--border)] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10"
          style={{
            background:
              "linear-gradient(90deg, var(--bg-primary) 0%, transparent 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10"
          style={{
            background:
              "linear-gradient(270deg, var(--bg-primary) 0%, transparent 100%)",
          }}
        />
        <div className="ticker gap-10 px-4 py-3 text-[11px] font-mono uppercase tracking-[0.22em] text-[var(--text-tertiary)]">
          {[...TICKER, ...TICKER].map((s, i) => (
            <span key={i} className="inline-flex items-center gap-3 whitespace-nowrap">
              <span className="h-1 w-1 rounded-full bg-[var(--text-tertiary)]" />
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
