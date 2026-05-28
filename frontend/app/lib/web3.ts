"use client";

import { createPublicClient, createWalletClient, custom, defineChain, http } from "viem";
import type { EIP1193Provider } from "./wallet-discovery";

/**
 * Plain Base mainnet definition. We avoid viem's bundled `base` export
 * because its chain-specific block formatters diverge from the generic
 * Chain type that @metamask/smart-accounts-kit's actions expect.
 */
export const base = defineChain({
  id: 8453,
  name: "Base",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://mainnet.base.org"] } },
  blockExplorers: { default: { name: "BaseScan", url: "https://basescan.org" } },
});

export const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

/** Browser-side public client. Used for chain reads (balances, code, etc.). */
export const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

/**
 * Fallback when no EIP-6963 wallet announces itself. Returns whatever
 * legacy injection grabbed `window.ethereum`. Use this only as a last
 * resort.
 */
export function getInjectedProvider(): EIP1193Provider | null {
  if (typeof window === "undefined") return null;
  const eth = (window as unknown as { ethereum?: EIP1193Provider }).ethereum;
  return eth ?? null;
}

/**
 * Ask the wallet to switch to Base. Adds the chain first if the wallet
 * rejects with code 4902 ("chain not configured").
 */
export async function ensureBaseChain(provider: EIP1193Provider): Promise<void> {
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${(8453).toString(16)}` }],
    });
  } catch (err) {
    const code = (err as { code?: number }).code;
    if (code !== 4902) throw err;
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${(8453).toString(16)}`,
          chainName: "Base",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://mainnet.base.org"],
          blockExplorers: ["https://basescan.org"],
        },
      ],
    });
  }
}

/**
 * Connect a specific EIP-1193 provider (chosen via the in-app picker)
 * and return a viem walletClient bound to its first account.
 */
export async function connectWithProvider(provider: EIP1193Provider) {
  const accounts = (await provider.request({ method: "eth_requestAccounts" })) as `0x${string}`[];
  if (!accounts || accounts.length === 0) {
    throw new Error("Wallet returned no accounts.");
  }
  await ensureBaseChain(provider);
  const walletClient = createWalletClient({
    chain: base,
    transport: custom(provider),
    account: accounts[0],
  });
  return { walletClient, address: accounts[0], provider };
}
