"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, KeyRound, ShieldCheck, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { parseUnits } from "viem";
import { erc7715ProviderActions } from "@metamask/smart-accounts-kit/actions";
import { connectWithProvider, USDC_BASE } from "../lib/web3";
import {
  type EIP1193Provider,
  type EIP6963ProviderDetail,
} from "../lib/wallet-discovery";
import {
  clearGrant,
  loadGrant,
  saveGrant,
  type StoredGrant,
} from "../lib/permission-store";
import { cn, formatError } from "../lib/utils";
import { Btn } from "./ui/Btn";
import { Paper } from "./ui/Paper";
import { WalletPicker } from "./WalletPicker";

const SESSION_ACCOUNT_ADDRESS =
  (process.env.NEXT_PUBLIC_SESSION_ACCOUNT as `0x${string}` | undefined) ??
  ("0x5Aea061d814A72de9EE9171bE86F45f48e1E2f5d" as `0x${string}`);

const PRESET_BUDGETS = [
  { label: "$2", per: "wk", usd: 2 },
  { label: "$5", per: "wk", usd: 5 },
  { label: "$10", per: "wk", usd: 10 },
];

type PickerIntent = "connect" | "grant" | null;

export default function OnboardingPanel() {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [pickerIntent, setPickerIntent] = useState<PickerIntent>(null);
  const [busy, setBusy] = useState<"connect" | "grant" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [grant, setGrant] = useState<StoredGrant | null>(null);
  const [budgetUsd, setBudgetUsd] = useState(2);
  const [walletName, setWalletName] = useState<string | null>(null);
  const providerRef = useRef<EIP1193Provider | null>(null);

  useEffect(() => {
    setGrant(loadGrant());
  }, []);

  function openPicker(intent: Exclude<PickerIntent, null>) {
    setError(null);
    setPickerIntent(intent);
  }

  async function onPick(detail: EIP6963ProviderDetail) {
    const intent = pickerIntent;
    setPickerIntent(null);
    if (!intent) return;
    setWalletName(detail.info.name);
    providerRef.current = detail.provider;
    if (intent === "connect") {
      await runConnect(detail.provider);
    } else {
      await runGrant(detail.provider);
    }
  }

  async function runConnect(provider: EIP1193Provider) {
    setBusy("connect");
    try {
      const { address } = await connectWithProvider(provider);
      setAddress(address);
    } catch (e) {
      setError(formatError(e));
    } finally {
      setBusy(null);
    }
  }

  async function runGrant(provider: EIP1193Provider) {
    setBusy("grant");
    try {
      const { walletClient, address } = await connectWithProvider(provider);
      setAddress(address);
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
    <>
      <WalletPicker
        open={pickerIntent !== null}
        onClose={() => setPickerIntent(null)}
        onPick={onPick}
      />

      <Paper variant="thick" className="overflow-hidden">
        <div className="grid grid-cols-12">
          <div className="col-span-12 lg:col-span-5 p-6 sm:p-7 border-b lg:border-b-0 lg:border-r border-white/[0.04]">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  Step 01
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-zinc-100 mt-1">
                  Grant a budget
                </h3>
              </div>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              One MetaMask signature. ERC-7715 advanced permission with a
              weekly cap, an expiry, and an allowed callee list. The agent
              redeems against it through ERC-7710 on every PAY.
            </p>
            <div className="hairline my-5" />
            <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 mb-2 font-mono">
              wallet
            </div>
            <div className="text-sm font-mono">
              {address ? (
                <span>
                  {walletName ? (
                    <span className="text-zinc-300">{walletName} </span>
                  ) : null}
                  <span className="text-zinc-500">·</span>{" "}
                  <span className="text-zinc-200">{shortAddr(address)}</span>
                </span>
              ) : (
                <span className="text-zinc-500">not connected</span>
              )}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-7 p-6 sm:p-7 flex flex-col gap-5">
            <AnimatePresence>
              {error ? (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-lg border border-rose-700/40 bg-rose-950/30 px-3 py-2 text-sm text-rose-200"
                >
                  {error}
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence mode="wait" initial={false}>
              {!grant ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-5"
                >
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 mb-2 font-mono">
                      weekly cap
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
                                : "border-white/[0.07] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200",
                            )}
                          >
                            <span className="tabnum">{b.label}</span>
                            <span className="text-zinc-500 ml-1">/ {b.per}</span>
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
                      <Btn onClick={() => openPicker("connect")} loading={busy === "connect"} variant="ghost">
                        <Wallet className="h-4 w-4" />
                        Connect wallet
                      </Btn>
                    ) : (
                      <Btn variant="ghost" disabled>
                        <Check className="h-4 w-4 text-emerald-300" />
                        Connected
                      </Btn>
                    )}
                    <Btn
                      variant="primary"
                      onClick={() => openPicker("grant")}
                      loading={busy === "grant"}
                    >
                      <KeyRound className="h-4 w-4" />
                      Sign ERC-7715 grant
                    </Btn>
                  </div>

                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    The cap is not an escrow. The agent can only spend up to{" "}
                    <span className="text-zinc-300">${budgetUsd}</span> when it
                    actually pays a merchant.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex flex-col gap-4"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Field
                      label="cap"
                      value={`$${(Number(BigInt(grant.periodAmount)) / 1e6).toFixed(2)}`}
                      accent
                    />
                    <Field label="period" value={`${Math.round(grant.periodDuration / 86400)}d`} />
                    <Field
                      label="expires"
                      value={new Date(grant.expiry * 1000).toLocaleDateString()}
                    />
                    <Field label="signer" value={shortAddr(grant.signerAddress)} mono />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 text-xs text-emerald-300">
                      <Check className="h-4 w-4" />
                      Active — agent redeems on every PAY.
                    </div>
                    <Btn variant="danger" size="sm" onClick={onRevokeLocal}>
                      Forget grant
                    </Btn>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Paper>
    </>
  );
}

function Field({
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
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.012] px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 text-base font-semibold tracking-tight tabnum",
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
