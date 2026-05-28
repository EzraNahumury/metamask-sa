"use client";

import { ArrowUpRight, Zap } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[rgba(0,0,0,0.55)] border-b border-white/[0.05]">
      <div className="px-4 sm:px-8 h-14 flex items-center justify-between gap-3">
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-[var(--text-tertiary)] font-mono uppercase tracking-[0.18em]">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-[var(--accent)] pulse-soft" />
            <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          </span>
          Live on Base mainnet
        </div>
        <div className="ml-auto flex items-center gap-2">
          <a
            href="https://github.com/EzraNahumury/metamask-sa"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-[12.5px]"
          >
            Source
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <a
            href="http://localhost:3000"
            className="btn-primary inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-[12.5px] font-medium"
          >
            <Zap className="h-3.5 w-3.5" />
            Launch app
          </a>
        </div>
      </div>
    </header>
  );
}
