"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  Brain,
  CircleDollarSign,
  Headphones,
  RadioTower,
  ShieldCheck,
  Workflow,
} from "lucide-react";

type Feature = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
};

const FEATURES: Feature[] = [
  {
    icon: ShieldCheck,
    title: "Bounded by a single signature",
    body:
      "One ERC-7715 grant. Weekly cap, expiry, allowed callees — caveats run onchain and the agent literally cannot outspend them.",
  },
  {
    icon: Brain,
    title: "Real Venice reasoning",
    body:
      "Every invoice is read by a Venice text model with a strict JSON schema. PAY, REFUSE, or ESCALATE — never a hardcoded if-else.",
  },
  {
    icon: CircleDollarSign,
    title: "Pays in USDC, not ETH",
    body:
      "The 1Shot permissionless relayer broadcasts every ERC-7710 redemption, takes its fee in USDC, and the user never holds a paymaster.",
  },
  {
    icon: RadioTower,
    title: "Refuses anomalies in real time",
    body:
      "A 32× quote inflation triggers a refuse on the same tick — Venice surfaces the reason, the dashboard streams it via SSE, the wallet stays untouched.",
  },
  {
    icon: Workflow,
    title: "x402 native, no API keys",
    body:
      "The same wallet pays merchants and Venice. EIP-3009 transferWithAuthorization wrapped in the x402 v2 payload — no credit card, no account.",
  },
  {
    icon: Headphones,
    title: "Friday Brief, three modalities",
    body:
      "Text reasoning, a generated chart image, a 60-second voiceover. One Venice round-trip. Multi-endpoint by design, not by retrofit.",
  },
];

export function Features() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = root.current?.querySelectorAll<HTMLElement>(".feature-card");
    if (!cards) return;
    const trigger = (entries: IntersectionObserverEntry[]) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          gsap.fromTo(
            e.target,
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              duration: 0.55,
              ease: "power3.out",
              delay: ((e.target as HTMLElement).dataset.index ? Number((e.target as HTMLElement).dataset.index) : 0) * 0.05,
            },
          );
          io.unobserve(e.target);
        }
      }
    };
    const io = new IntersectionObserver(trigger, { rootMargin: "-100px" });
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  return (
    <section id="features" className="relative py-24 sm:py-28">
      <div className="max-w-3xl">
        <span className="section-eyebrow">What the agent ships</span>
        <h2 className="font-display mt-2 text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
          Six things a custody wallet
          <br /> simply cannot do.
        </h2>
        <p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-relaxed">
          Every feature below is wired to a real primitive — no demo theatre.
          Inspect the basescan links further down to verify onchain.
        </p>
      </div>

      <div ref={root} className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              data-index={i}
              className="feature-card card p-5 sm:p-6 opacity-0"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-glow)] text-[var(--accent-light)]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                {f.title}
              </h3>
              <p className="mt-2 text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
                {f.body}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
