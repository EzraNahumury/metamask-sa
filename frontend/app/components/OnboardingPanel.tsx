"use client";

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

const SESSION_ACCOUNT_ADDRESS =
  (process.env.NEXT_PUBLIC_SESSION_ACCOUNT as `0x${string}` | undefined) ??
  ("0x5Aea061d814A72de9EE9171bE86F45f48e1E2f5d" as `0x${string}`);

const PRESET_BUDGETS: Array<{ label: string; usd: number }> = [
  { label: "$2 / week", usd: 2 },
  { label: "$5 / week", usd: 5 },
  { label: "$10 / week", usd: 10 },
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
      setError(e instanceof Error ? e.message : String(e));
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
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  function onRevokeLocal() {
    clearGrant();
    setGrant(null);
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 mb-8">
      <header className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-50">
            Activate <span className="text-emerald-400">DeleGate</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1 max-w-md">
            Connect a MetaMask Smart Account and grant the agent an ERC-7715
            advanced permission. Caveats (cap, period, allowed callees) are
            enforced onchain — revocable in one tap.
          </p>
        </div>
        <div className="sm:ml-auto flex items-center gap-2 text-[11px] uppercase tracking-wider text-zinc-500">
          {address ? (
            <span>
              wallet{" "}
              <span className="text-zinc-300 font-mono">
                {address.slice(0, 6)}…{address.slice(-4)}
              </span>
            </span>
          ) : (
            <span>not connected</span>
          )}
        </div>
      </header>

      {error ? (
        <div className="mb-4 rounded-lg border border-rose-800/60 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {!grant ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-zinc-500">
              Weekly cap
            </span>
            {PRESET_BUDGETS.map((b) => (
              <button
                key={b.usd}
                onClick={() => setBudgetUsd(b.usd)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                  budgetUsd === b.usd
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-200"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {!address ? (
              <button
                onClick={onConnect}
                disabled={busy !== null}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-emerald-950 text-sm font-medium hover:bg-emerald-400 disabled:opacity-40 transition"
              >
                {busy === "connect" ? "Connecting…" : "Connect MetaMask"}
              </button>
            ) : null}
            <button
              onClick={onGrant}
              disabled={busy !== null}
              className="px-4 py-2 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-white disabled:opacity-40 transition"
            >
              {busy === "grant"
                ? "Awaiting MetaMask…"
                : `Grant DeleGate $${budgetUsd}/week`}
            </button>
          </div>
          <p className="text-[11px] text-zinc-600">
            Note: setting the cap does not move any USDC. The agent can only
            spend up to the cap when it actually pays a merchant — anything
            unspent stays in your wallet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <Field
              label="Cap"
              value={`$${Number(BigInt(grant.periodAmount)) / 1e6}`}
              accent="emerald"
            />
            <Field
              label="Period"
              value={`${Math.round(grant.periodDuration / 86400)}d`}
            />
            <Field
              label="Expires"
              value={new Date(grant.expiry * 1000).toLocaleDateString()}
            />
            <Field
              label="Session signer"
              value={`${grant.signerAddress.slice(0, 6)}…${grant.signerAddress.slice(-4)}`}
            />
          </div>
          <p className="text-xs text-emerald-300">
            ✓ DeleGate is active. Subsequent ticks will redeem this 7715 grant
            via the agent's session account.
          </p>
          <div>
            <button
              onClick={onRevokeLocal}
              className="px-3 py-1.5 text-xs rounded-lg border border-rose-800/60 bg-rose-950/30 text-rose-200 hover:bg-rose-900/40 transition"
            >
              Forget grant (local)
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "emerald";
}) {
  const accentColor = accent === "emerald" ? "text-emerald-400" : "text-zinc-100";
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={`text-base font-semibold ${accentColor} font-mono`}>{value}</div>
    </div>
  );
}
