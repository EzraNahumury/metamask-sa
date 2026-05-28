"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import type { Decision, MerchantService } from "../lib/types";

type ServiceStatus = "idle" | "paid" | "refused";

/**
 * Per-merchant strip: latest action, price, and a short history strip
 * showing the last 5 actions as little squares (paid=emerald, refused=rose,
 * idle=zinc).
 */
export function ServiceHealthStrip({
  services,
  decisions,
}: {
  services: MerchantService[];
  decisions: Decision[];
}) {
  if (services.length === 0) return null;

  const historyMap = new Map<string, Decision[]>();
  for (const d of decisions) {
    const arr = historyMap.get(d.service) ?? [];
    arr.push(d);
    historyMap.set(d.service, arr);
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {services.map((s, i) => {
        const history = historyMap.get(s.slug) ?? [];
        const latest = history[0];
        const status: ServiceStatus = !latest
          ? "idle"
          : latest.action === "PAY"
          ? "paid"
          : latest.action === "REFUSE"
          ? "refused"
          : "idle";
        const recent = history.slice(0, 5).reverse();
        return (
          <motion.div
            key={s.slug}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i, duration: 0.3 }}
            className={cn(
              "group relative rounded-xl border bg-white/[0.012] backdrop-blur p-3 transition-all",
              status === "paid"
                ? "border-emerald-500/25 hover:border-emerald-400/50"
                : status === "refused"
                ? "border-rose-500/25 hover:border-rose-400/50"
                : "border-white/[0.05] hover:border-white/15",
            )}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <Dot status={status} />
                <span className="text-[12px] text-zinc-200 font-medium truncate">
                  {s.displayName.replace("-mock", "")}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono tabnum">
                ${(Number(BigInt(s.normalPriceMicroUsdc)) / 1e6).toFixed(2)}
              </span>
            </div>
            <HistoryStrip history={recent} length={5} />
          </motion.div>
        );
      })}
    </div>
  );
}

function Dot({ status }: { status: ServiceStatus }) {
  const color =
    status === "paid"
      ? "bg-emerald-400"
      : status === "refused"
      ? "bg-rose-400"
      : "bg-zinc-600";
  return (
    <span className="relative inline-flex h-1.5 w-1.5">
      {status === "paid" ? (
        <span className="absolute inset-0 rounded-full bg-emerald-400/60 pulse-soft" />
      ) : null}
      <span className={cn("relative inline-block h-1.5 w-1.5 rounded-full", color)} />
    </span>
  );
}

function HistoryStrip({ history, length }: { history: Decision[]; length: number }) {
  const filled = Array.from({ length }).map((_, i) => history[i] ?? null);
  return (
    <div className="flex gap-1 items-center">
      {filled.map((d, i) => {
        const tone = !d
          ? "bg-white/[0.04]"
          : d.action === "PAY"
          ? "bg-emerald-400/70"
          : d.action === "REFUSE"
          ? "bg-rose-400/70"
          : "bg-amber-400/70";
        return (
          <span
            key={i}
            className={cn("h-1.5 flex-1 rounded-sm transition-colors", tone)}
            title={d ? `${d.action} · ${new Date(d.decidedAt).toLocaleTimeString()}` : "no history"}
          />
        );
      })}
    </div>
  );
}
