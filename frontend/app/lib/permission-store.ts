"use client";

const KEY = "delegate-ai.grant";

export type StoredGrant = {
  signerAddress: `0x${string}`;
  /** When the grant was requested (ISO string). */
  grantedAt: string;
  /** When the grant expires (unix seconds, from the kit's response). */
  expiry: number;
  /** Maximum spend per period (micro-USDC string). */
  periodAmount: string;
  /** Period duration in seconds. */
  periodDuration: number;
  /** Token address the grant authorises (USDC on Base). */
  tokenAddress: `0x${string}`;
  /**
   * Whatever the kit returned. We don't strictly type it because the kit's
   * response shape isn't stable across versions yet; the raw blob is what
   * a session redeemer needs.
   */
  rawResponse: unknown;
};

export function saveGrant(g: StoredGrant) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(g));
}

export function loadGrant(): StoredGrant | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredGrant;
  } catch {
    return null;
  }
}

export function clearGrant() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
