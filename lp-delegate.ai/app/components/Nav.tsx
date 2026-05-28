"use client";

import { motion } from "framer-motion";
import { Github } from "lucide-react";
import Image from "next/image";

const LINKS = [
  { label: "How it works", href: "#how" },
  { label: "Onchain proof", href: "#proof" },
  { label: "Stack", href: "#stack" },
];

export function Nav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
      className="fixed top-0 inset-x-0 z-40"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-5">
        <nav className="glass rounded-2xl flex items-center justify-between px-3 py-2">
          <a href="#top" className="inline-flex items-center gap-2.5 group pl-2">
            <span className="relative inline-flex h-7 w-7 items-center justify-center">
              <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-400/35 via-sky-400/15 to-violet-400/20 blur-md opacity-80" />
              <Image
                src="/logo.png"
                width={26}
                height={26}
                alt="DeleGate.AI"
                priority
                className="relative object-contain"
              />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[13px] font-semibold tracking-tight text-zinc-100">
                DeleGate<span className="text-grad">.AI</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.22em] text-zinc-500">
                onchain chief of staff
              </span>
            </span>
          </a>

          <ul className="hidden md:flex items-center gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="px-3 py-1.5 text-[13px] text-zinc-400 hover:text-zinc-100 transition-colors rounded-lg hover:bg-white/[0.05]"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1.5">
            <a
              href="https://github.com/EzraNahumury/metamask-sa"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="github"
              className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-white/[0.06] text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05] transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="#launch"
              className="btn-primary inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-[13px] font-medium tracking-tight"
            >
              Launch app
            </a>
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
