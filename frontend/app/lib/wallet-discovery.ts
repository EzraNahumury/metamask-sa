"use client";

/**
 * EIP-6963 multi-provider discovery.
 *
 * When the user has more than one wallet installed (MetaMask + Rabby +
 * Coinbase + …), they all race to inject `window.ethereum`. Whichever
 * loads first wins, which is why a fresh page sometimes pops Rabby's
 * picker instead of MetaMask's. EIP-6963 is the standard fix: every
 * wallet announces itself via the `eip6963:announceProvider` event with
 * its name, icon, and rdns. We collect them, render our own picker, and
 * use the chosen provider directly — no more wallet land grab.
 */
import { useEffect, useState } from "react";

export type EIP6963ProviderInfo = {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
};

export type EIP1193Provider = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
};

export type EIP6963ProviderDetail = {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
};

type AnnounceEvent = CustomEvent<EIP6963ProviderDetail>;

const REQUEST_EVENT = "eip6963:requestProvider";
const ANNOUNCE_EVENT = "eip6963:announceProvider";

export function useDiscoveredWallets(): EIP6963ProviderDetail[] {
  const [wallets, setWallets] = useState<EIP6963ProviderDetail[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = new Map<string, EIP6963ProviderDetail>();

    function onAnnounce(e: Event) {
      const detail = (e as AnnounceEvent).detail;
      if (!detail) return;
      seen.set(detail.info.uuid, detail);
      setWallets(Array.from(seen.values()));
    }

    window.addEventListener(ANNOUNCE_EVENT, onAnnounce as EventListener);
    window.dispatchEvent(new Event(REQUEST_EVENT));

    return () => {
      window.removeEventListener(ANNOUNCE_EVENT, onAnnounce as EventListener);
    };
  }, []);

  return wallets;
}

/**
 * Find the MetaMask provider in particular (we name it explicitly in
 * the hackathon submission). Falls back to any 6963-announced wallet
 * if MetaMask isn't installed.
 */
export function pickMetaMask(
  wallets: EIP6963ProviderDetail[],
): EIP6963ProviderDetail | null {
  return (
    wallets.find((w) => w.info.rdns === "io.metamask") ??
    wallets.find((w) => w.info.name.toLowerCase().includes("metamask")) ??
    null
  );
}
