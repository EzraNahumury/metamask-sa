"use client";

import { Radio } from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.04] py-10">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between text-[12px] text-zinc-500">
        <div className="inline-flex items-center gap-3">
          <Image src="/logo.png" width={24} height={24} alt="DeleGate.AI" className="opacity-90" />
          <div>
            <div className="text-zinc-300 font-medium tracking-tight">DeleGate.AI</div>
            <div className="text-[11px] text-zinc-600 font-mono">
              chief of staff for onchain money
            </div>
          </div>
        </div>

        <nav className="flex flex-wrap gap-4 font-mono text-[11px]">
          <a href="#how" className="hover:text-zinc-200 transition-colors">How it works</a>
          <a href="#proof" className="hover:text-zinc-200 transition-colors">Onchain proof</a>
          <a href="#stack" className="hover:text-zinc-200 transition-colors">Stack</a>
          <a
            href="https://github.com/EzraNahumury/metamask-sa"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-200 transition-colors"
          >
            GitHub
          </a>
        </nav>

        <div className="inline-flex items-center gap-2 text-[11px] font-mono">
          <Radio className="h-3 w-3 text-emerald-400" />
          Base mainnet · 8453
        </div>
      </div>
    </footer>
  );
}
