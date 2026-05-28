"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, Info, X } from "lucide-react";
import { useToasts, type ToastTone } from "../../lib/useToasts";
import { cn } from "../../lib/utils";

const toneClass: Record<ToastTone, { wrap: string; icon: string; pill: string }> = {
  info: {
    wrap: "border-zinc-700/60 bg-zinc-900/85",
    icon: "text-zinc-300",
    pill: "bg-zinc-700/40",
  },
  success: {
    wrap: "border-emerald-700/40 bg-emerald-950/40",
    icon: "text-emerald-300",
    pill: "bg-emerald-500/20",
  },
  danger: {
    wrap: "border-rose-700/50 bg-rose-950/50",
    icon: "text-rose-300",
    pill: "bg-rose-500/20",
  },
  warn: {
    wrap: "border-amber-700/40 bg-amber-950/40",
    icon: "text-amber-300",
    pill: "bg-amber-500/20",
  },
};

const ICONS: Record<ToastTone, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: Check,
  danger: AlertTriangle,
  warn: AlertTriangle,
};

export function Toaster() {
  const { toasts, close } = useToasts();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[330px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const c = toneClass[t.tone];
          const Icon = ICONS[t.tone];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.24, ease: [0.2, 0.7, 0.2, 1] }}
              className={cn(
                "pointer-events-auto group flex items-start gap-3 rounded-xl border px-3.5 py-3 backdrop-blur shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)]",
                c.wrap,
              )}
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg",
                  c.pill,
                )}
              >
                <Icon className={cn("h-4 w-4", c.icon)} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-zinc-100 truncate">{t.title}</div>
                {t.body ? (
                  <div className="mt-0.5 text-[12px] text-zinc-400 leading-snug">
                    {t.body}
                  </div>
                ) : null}
              </div>
              <button
                onClick={() => close(t.id)}
                className="text-zinc-600 hover:text-zinc-200 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
