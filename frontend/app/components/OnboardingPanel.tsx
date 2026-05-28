"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, KeyRound, ShieldCheck, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { parseUnits } from "viem";
import { erc7715ProviderActions } from "@metamask/smart-accounts-kit/actions";
import { connectWallet, USDC_BASE } from "../lib/web3";
import {
  clearGrant,
  loadGrant,
  saveGrant,
  type StoredGrant,
} from "../lib/permission-store";
import { cn, formatError } from "../lib/utils";
import { GlassCard } from "./ui/GlassCard";
import { PrimaryButton } from "./ui/PrimaryButton";

const SESSION_ACCOUNT_ADDRESS =
  (process.env.NEXT_PUBLIC_SESSION_ACCOUNT as `0x${string}` | undefined) ??
  ("0x5Aea061d814A72de9EE9171bE86F45f48e1E2f5d" as `0x${string}`);

const PRESET_BUDGETS = [
  { label: "$2", per: "/wk", usd: 2 },
  { label: "$5", per: "/wk", usd: 5 },
  { label: "$10", per: "/wk", usd: 10 },
];

export default function OnboardingPanel() {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [busy, setBusy] = useState<"connect" | "grant" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [grant, setGrant] = useState<StoredGrant | null>(null);
  const [budgetUsd, setBudgetUsd] = useState(2);

  useEffect(() => {
    setGrant(loadGrant());
  }, []);

  async function onConnect() {
    setError(null);
    setBusy("connect");
    try {
      const { address } = await connectWallet();
      setAddress(address);
    } catch (e) {
      setError(formatError(e));
    } finally {
      setBusy(null);
    }
  }

  async function onGrant() {
    setError(null);
    setBusy("grant");
    try {
      const { walletClient } = await connectWallet();
      const extended = walletClient.extend(erc7715ProviderActions());

      const currentTime = Math.floor(Date.now() / 1000);
      const expiry = currentTime + 7 * 24 * 60 * 60;
      const periodAmount = parseUnits(String(budgetUsd), 6);

      const response = await extended.requestExecutionPermissions([
        {
          chainId: 8453,
          expiry,
          to: SESSION_ACCOUNT_ADDRESS,
          permission: {
            type: "erc20-token-periodic",
            isAdjustmentAllowed: true,
            data: {
              tokenAddress: USDC_BASE,
              periodAmount,
              periodDuration: 7 * 24 * 60 * 60,
              justification: `DeleGate.AI weekly budget of $${budgetUsd} for x402 subscription payments.`,
            },
          },
        },
      ]);

      const stored: StoredGrant = {
        signerAddress: SESSION_ACCOUNT_ADDRESS,
        grantedAt: new Date().toISOString(),
        expiry,
        periodAmount: periodAmount.toString(),
        periodDuration: 7 * 24 * 60 * 60,
        tokenAddress: USDC_BASE,
        rawResponse: response,
      };
      saveGrant(stored);
      setGrant(stored);
    } catch (e) {
      setError(formatError(e));
    } finally {
      setBusy(null);
    }
  }

  function onRevokeLocal() {
    clearGrant();
    setGrant(null);
  }

  return (
    <GlassCard className="mb-8 p-6 sm:p-7">
      <header className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6 mb-5">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-50">
              Activate <span className="text-grad">DeleGate</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-1 max-w-md leading-relaxed">
              Connect a MetaMask Smart Account, then grant an{" "}
              <span className="text-zinc-300">ERC-7715</span> advanced permission. Caveats run
              onchain — revocable in one tap.
            </p>
          </div>
        </div>
        <div className="sm:ml-auto text-[11px] uppercase tracking-[0.18em] text-zinc-500 font-mono">
          {address ? (
            <span>
              wallet <span className="text-zinc-300">{shortAddr(address)}</span>
            </span>
          ) : (
            <span>not connected</span>
          )}
        </div>
      </header>

      <AnimatePresence>
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 rounded-lg border border-rose-700/40 bg-rose-950/30 px-3 py-2 text-sm text-rose-200"
          >
            {error}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        {!grant ? (
          <motion.div
            key="grant-form"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-5"
          >
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 mb-2">
                Weekly cap
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_BUDGETS.map((b) => {
                  const active = budgetUsd === b.usd;
                  return (
                    <motion.button
                      key={b.usd}
                      onClick={() => setBudgetUsd(b.usd)}
                      whileTap={{ scale: 0.97 }}
                      className={cn(
                        "relative h-11 min-w-[88px] rounded-xl border px-3 text-sm font-medium transition-colors",
                        active
                          ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-200"
                          : "border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200",
                      )}
                    >
                      <span className="tabular-nums">{b.label}</span>
                      <span className="text-zinc-500 ml-0.5">{b.per}</span>
                      {active ? (
                        <motion.span
                          layoutId="cap-pill"
                          className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-emerald-400/40"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      ) : null}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!address ? (
                <PrimaryButton onClick={onConnect} loading={busy === "connect"}>
                  <Wallet className="h-4 w-4" />
                  Connect MetaMask
                </PrimaryButton>
              ) : (
                <PrimaryButton variant="ghost" disabled>
                  <Check className="h-4 w-4 text-emerald-300" />
                  Connected
                </PrimaryButton>
              )}
              <PrimaryButton variant="secondary" onClick={onGrant} loading={busy === "grant"}>
                <KeyRound className="h-4 w-4" />
                Grant DeleGate ${budgetUsd}/week
              </PrimaryButton>
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Note: the cap is not an escrow. The agent can only spend up to{" "}
              <span className="text-zinc-300">${budgetUsd}</span> when it actually pays a merchant
              — anything unused stays in your wallet.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="grant-status"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <CaveatField
                label="Cap"
                value={`$${(Number(BigInt(grant.periodAmount)) / 1e6).toFixed(2)}`}
                accent
              />
              <CaveatField label="Period" value={`${Math.round(grant.periodDuration / 86400)}d`} />
              <CaveatField
                label="Expires"
                value={new Date(grant.expiry * 1000).toLocaleDateString()}
              />
              <CaveatField label="Session signer" value={shortAddr(grant.signerAddress)} mono />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-xs text-emerald-300">
                <Check className="h-4 w-4" /> DeleGate active — agent redeems this grant on every PAY.
              </div>
              <PrimaryButton variant="danger" size="sm" onClick={onRevokeLocal}>
                Forget grant
              </PrimaryButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

function CaveatField({
  label,
  value,
  accent,
  mono,
}: {
  label: string;
  value: string;
  accent?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div
        className={cn(
          "mt-0.5 text-base font-semibold tracking-tight tabular-nums",
          accent ? "text-emerald-300" : "text-zinc-100",
          mono && "font-mono text-sm",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
