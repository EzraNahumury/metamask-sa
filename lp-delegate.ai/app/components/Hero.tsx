"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ArrowUpRight, Zap } from "lucide-react";

const BASESCAN_PROOF =
  "https://basescan.org/tx/0xf199a88f1f7e2d28005365acd5ba63793d166c6b1d94cf77a2a807f53746052c";

export function Hero() {
  const eyebrow = useRef<HTMLSpanElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const body = useRef<HTMLParagraphElement>(null);
  const ctas = useRef<HTMLDivElement>(null);
  const stats = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (eyebrow.current) tl.fromTo(eyebrow.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45 });
    if (headline.current) tl.fromTo(headline.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.2");
    if (body.current) tl.fromTo(body.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.55 }, "-=0.4");
    if (ctas.current) tl.fromTo(ctas.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.35");
    if (stats.current) {
      const cells = stats.current.querySelectorAll(":scope > div");
      tl.fromTo(cells, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.08 }, "-=0.3");
    }
  }, []);

  return (
    <section id="top" className="relative pt-12 sm:pt-16 pb-24 sm:pb-28">
      <span
        ref={eyebrow}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/[0.02] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[var(--text-tertiary)]"
      >
        <span className="relative inline-flex h-1.5 w-1.5">
          <span className="absolute inset-0 rounded-full bg-[var(--accent)] pulse-soft" />
          <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
        </span>
        Chain 8453 · Base mainnet
      </span>

      <h1
        ref={headline}
        className="font-display mt-6 text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[0.95]"
      >
        Hire <span className="font-light text-[var(--text-secondary)]">an agent.</span>
        <br />
        <span className="text-grad font-semibold">Keep the keys.</span>
      </h1>

      <p
        ref={body}
        className="mt-7 max-w-2xl text-[15px] sm:text-base text-[var(--text-secondary)] leading-relaxed"
      >
        DeleGate.AI is a scoped MetaMask permission and an autonomous reasoning
        agent. It pays your subscriptions over x402, refuses suspicious quotes
        in real time, and ships a Friday Brief in three Venice modalities. All
        on Base. Nothing custodial.
      </p>

      <div ref={ctas} className="mt-9 flex flex-wrap items-center gap-3">
        <a
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
      </div>

      <div ref={stats} className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
        {[
          { k: "Tracks targeted", v: "4 / 5" },
          { k: "Onchain settlements", v: "6" },
          { k: "Venice endpoints", v: "3" },
          { k: "Sponsor primitives", v: "9" },
        ].map((s) => (
          <div key={s.k} className="card px-4 py-3">
            <div className="section-eyebrow">{s.k}</div>
            <div className="mt-1 text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] tabnum tracking-tight">
              {s.v}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
