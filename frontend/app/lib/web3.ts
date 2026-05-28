"use client";

import { createPublicClient, createWalletClient, custom, defineChain, http } from "viem";

/**
 * Plain Base mainnet definition. We avoid viem's bundled `celo` / `base`
 * exports because their chain-specific block formatters diverge from the
 * generic Chain type that @metamask/smart-accounts-kit's actions expect.
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

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
};

/** Detect MetaMask (or any EIP-1193 provider) injected by the browser. */
export function getInjectedProvider(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  const eth = (window as unknown as { ethereum?: EthereumProvider }).ethereum;
  return eth ?? null;
}

/**
 * Ask the wallet to switch (or add) Base. Some wallets reject `wallet_switchEthereumChain`
 * with code 4902 if the chain isn't known — in which case we add it first.
 */
export async function ensureBaseChain(provider: EthereumProvider): Promise<void> {
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

/** Connect the injected wallet, switch to Base, return a viem walletClient. */
export async function connectWallet() {
  const provider = getInjectedProvider();
  if (!provider) {
    throw new Error(
      "No EIP-1193 provider found. Install MetaMask (or any compatible wallet) and reload.",
    );
  }
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
