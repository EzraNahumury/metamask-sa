"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import type { Decision, MerchantService } from "../lib/types";

type ServiceStatus = "idle" | "paid" | "refused";

export function ServiceHealthStrip({
  services,
  decisions,
}: {
  services: MerchantService[];
  decisions: Decision[];
}) {
  if (services.length === 0) return null;
  const latestByService = new Map<string, Decision>();
  for (const d of decisions) {
    if (!latestByService.has(d.service)) latestByService.set(d.service, d);
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
      {services.map((s, i) => {
        const latest = latestByService.get(s.slug);
        const status: ServiceStatus = !latest
          ? "idle"
          : latest.action === "PAY"
          ? "paid"
          : latest.action === "REFUSE"
          ? "refused"
          : "idle";
        return (
          <motion.div
            key={s.slug}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.32 }}
            className={cn(
              "group relative rounded-xl border bg-white/[0.015] backdrop-blur px-3 py-2.5 transition-all",
              status === "paid"
                ? "border-emerald-500/30 hover:border-emerald-400/60"
                : status === "refused"
                ? "border-rose-500/30 hover:border-rose-400/60"
                : "border-white/[0.06] hover:border-white/15",
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <Dot status={status} />
              <span className="text-[11px] text-zinc-300 font-medium truncate">
                {s.displayName.replace("-mock", "")}
              </span>
            </div>
            <div className="text-[10px] text-zinc-500 font-mono tabular-nums">
              ${(Number(BigInt(s.normalPriceMicroUsdc)) / 1e6).toFixed(2)}
              <span className="text-zinc-700"> / call</span>
            </div>
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
