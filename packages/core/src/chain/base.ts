import { defineChain } from "viem";

/**
 * Plain Base mainnet definition without viem's chain-specific block
 * formatters. The MetaMask Smart Accounts Kit generic Chain type rejects
 * viem's `celo` and similar legacy formatters; using `defineChain` keeps
 * the Client signature compatible with the kit.
 */
export const base = defineChain({
  id: 8453,
  name: "Base",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://mainnet.base.org"] } },
  blockExplorers: { default: { name: "BaseScan", url: "https://basescan.org" } },
});

export const BASE_CHAIN_ID = 8453 as const;
