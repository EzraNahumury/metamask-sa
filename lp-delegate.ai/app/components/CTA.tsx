"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Zap } from "lucide-react";

export function CTA() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="relative glass rounded-3xl p-8 sm:p-14 overflow-hidden text-center"
        >
          <div
            className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, rgba(16,185,129,0.25), transparent 70%)",
              filter: "blur(20px)",
            }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, rgba(167,139,250,0.2), transparent 70%)",
              filter: "blur(28px)",
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
          <div className="relative">
            <span className="inline-block text-[10px] uppercase tracking-[0.22em] text-emerald-300/80 font-mono">
              Boot the loop
            </span>
            <h2 className="display mt-3 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight max-w-3xl mx-auto">
              Your wallet stays yours.
              <br />
              <span className="text-grad">The agent does the work.</span>
            </h2>
            <p className="mt-5 text-[15px] text-zinc-400 leading-relaxed max-w-xl mx-auto">
              Three terminals, one signature, one tick. Six real transactions
              prove the rail works on Base mainnet today.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="http://localhost:3000"
                className="btn-primary inline-flex items-center gap-2 h-12 px-7 rounded-xl text-[15px] font-medium tracking-tight"
              >
                <Zap className="h-4 w-4" />
                Launch dashboard
              </a>
              <a
                href="https://github.com/EzraNahumury/metamask-sa"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost inline-flex items-center gap-2 h-12 px-6 rounded-xl text-[14px] tracking-tight"
              >
                Source on GitHub
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
