"use client";

import Image from "next/image";
import { Radio } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-10">
      <div className="flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between text-[12px] text-[var(--text-tertiary)]">
        <div className="inline-flex items-center gap-3">
          <Image
            src="/logo.png"
            width={24}
            height={24}
            alt="DeleGate.AI"
            className="opacity-90 rounded-lg"
          />
          <div>
            <div className="font-display text-[var(--text-secondary)] font-semibold tracking-tight">
              DeleGate.AI
            </div>
            <div className="text-[11px] text-[var(--text-tertiary)] font-mono">
              chief of staff for onchain money
            </div>
          </div>
        </div>
        <nav className="flex flex-wrap gap-4 font-mono text-[11px]">
          <a href="#features" className="hover:text-[var(--text-secondary)] transition-colors">
            Features
          </a>
          <a href="#how" className="hover:text-[var(--text-secondary)] transition-colors">
            How it works
          </a>
          <a href="#proof" className="hover:text-[var(--text-secondary)] transition-colors">
            Onchain proof
          </a>
          <a href="#stack" className="hover:text-[var(--text-secondary)] transition-colors">
            Stack
          </a>
          <a
            href="https://github.com/EzraNahumury/metamask-sa"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-secondary)] transition-colors"
          >
            GitHub
          </a>
        </nav>
        <div className="inline-flex items-center gap-2 text-[11px] font-mono">
          <Radio className="h-3 w-3 text-[var(--accent-light)]" />
          Base mainnet · 8453
        </div>
      </div>
    </footer>
  );
}
