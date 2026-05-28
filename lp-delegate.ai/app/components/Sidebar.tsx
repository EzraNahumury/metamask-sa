"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useScrollSpy } from "../hooks/useScrollSpy";

type NavItem = { label: string; href: string; id: string; icon: React.ReactNode };

const NAV: NavItem[] = [
  {
    label: "Overview",
    href: "#top",
    id: "top",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
        <path d="M1 1h5v5H1zM8 8h5v5H8zM8 1h5v5H8zM1 8h5v5H1z" />
      </svg>
    ),
  },
  {
    label: "Features",
    href: "#features",
    id: "features",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
        <rect x="1" y="1" width="12" height="12" rx="3" />
      </svg>
    ),
  },
  {
    label: "How it works",
    href: "#how",
    id: "how",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
        <path d="M2 7h4l2-4 2 8 2-4h4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Onchain proof",
    href: "#proof",
    id: "proof",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M4.5 7l2 2 3-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Stack",
    href: "#stack",
    id: "stack",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
        <path d="M7 1l6 3-6 3-6-3 6-3zM1 7l6 3 6-3M1 10l6 3 6-3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const SOCIALS = [
  {
    label: "GitHub",
    href: "https://github.com/EzraNahumury/metamask-sa",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const sectionIds = NAV.map((n) => n.id);
  const active = useScrollSpy(sectionIds, 160);

  const indicatorRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Slide the floating indicator behind the active item.
  useEffect(() => {
    const idx = NAV.findIndex((n) => n.id === active);
    const el = itemRefs.current[idx];
    const ind = indicatorRef.current;
    const list = listRef.current;
    if (!el || !ind || !list) return;
    const listBox = list.getBoundingClientRect();
    const itemBox = el.getBoundingClientRect();
    gsap.to(ind, {
      y: itemBox.top - listBox.top,
      height: itemBox.height,
      opacity: 1,
      duration: 0.36,
      ease: "power3.out",
    });
  }, [active]);

  // Mount entrance — logo, nav items stagger, bottom socials.
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.15 });
    if (logoRef.current) {
      gsap.set(logoRef.current, { opacity: 0, x: -16 });
      tl.to(logoRef.current, {
        opacity: 1,
        x: 0,
        duration: 0.45,
        ease: "power3.out",
      });
    }
    if (navRef.current) {
      const items = navRef.current.querySelectorAll("li");
      gsap.set(items, { opacity: 0, x: -14 });
      tl.to(
        items,
        {
          opacity: 1,
          x: 0,
          duration: 0.35,
          stagger: 0.06,
          ease: "power3.out",
        },
        "-=0.18",
      );
    }
    if (bottomRef.current) {
      gsap.set(bottomRef.current, { opacity: 0, y: 10 });
      tl.to(
        bottomRef.current,
        { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
        "-=0.1",
      );
    }
  }, []);

  function handleNavClick(href: string) {
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 24, behavior: "smooth" });
    }
    setMobileOpen(false);
  }

  return (
    <>
      {/* Mobile hamburger toggle */}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="menu"
        className="lg:hidden fixed top-4 left-4 z-50 h-10 w-10 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] flex items-center justify-center"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          {mobileOpen ? (
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          ) : (
            <>
              <line x1="3" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile fullscreen */}
      {mobileOpen ? (
        <div className="lg:hidden fixed inset-0 z-40 bg-[rgba(0,0,0,0.96)] backdrop-blur-xl flex flex-col items-center pt-24 pb-10">
          <div ref={logoRef} className="flex items-center gap-3 mb-12">
            <Image src="/logo.png" alt="DeleGate.AI" width={36} height={36} className="rounded-xl" />
            <span className="font-display text-xl font-semibold text-[var(--text-primary)]">
              DeleGate<span className="text-grad">.AI</span>
            </span>
          </div>
          <nav className="flex flex-col items-center gap-2 w-full max-w-xs">
            {NAV.map((item) => {
              const a = active === item.id;
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.href)}
                  className={`w-full inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl text-base font-medium transition-colors ${
                    a
                      ? "text-[#022c22] bg-[var(--accent)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.05]"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-auto flex items-center gap-5 text-[var(--text-tertiary)]">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:text-[var(--text-primary)] transition-colors"
                aria-label={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full z-40 w-[var(--sidebar-width)] bg-[rgba(8,10,18,0.65)] backdrop-blur-md border-r border-white/[0.06] flex-col">
        <div ref={logoRef} className="p-5 flex items-center gap-3">
          <Image src="/logo.png" alt="DeleGate.AI" width={32} height={32} className="rounded-xl" />
          <span className="font-display text-lg font-semibold text-[var(--text-primary)] tracking-tight">
            DeleGate<span className="text-grad">.AI</span>
          </span>
        </div>

        <nav ref={navRef} className="flex-1 pt-4 px-3 overflow-y-auto">
          <ul ref={listRef} className="space-y-1 relative">
            <div
              ref={indicatorRef}
              className="absolute left-0 right-0 rounded-full bg-[var(--accent)] pointer-events-none z-0"
              style={{ opacity: 0 }}
            />
            {NAV.map((item, i) => {
              const a = active === item.id;
              return (
                <li key={item.label} className="relative z-10">
                  <a
                    ref={(el) => {
                      itemRefs.current[i] = el;
                    }}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.href);
                    }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium transition-colors duration-150 ${
                      a
                        ? "text-[#022c22]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div ref={bottomRef} className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center justify-center gap-4 text-[var(--text-tertiary)]">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--text-secondary)] transition-colors"
                aria-label={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
