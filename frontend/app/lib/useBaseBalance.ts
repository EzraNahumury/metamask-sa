"use client";

import { useEffect, useState } from "react";
import { publicClient, USDC_BASE } from "./web3";

const ERC20_BALANCE_ABI = [
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

/**
 * Read a Base address' USDC balance (6 decimals). Returns null while
 * loading. Re-fetches if `address` changes.
 */
export function useBaseUsdcBalance(address: `0x${string}` | null | undefined) {
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setBalance(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const raw = (await publicClient.readContract({
          address: USDC_BASE,
          abi: ERC20_BALANCE_ABI,
          functionName: "balanceOf",
          args: [address],
        })) as bigint;
        if (cancelled) return;
        setBalance(Number(raw) / 1e6);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address]);

  return { balance, error };
}
