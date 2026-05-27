/**
 * In-memory state. Replaced by Postgres on Day 3, but the contract here is
 * exactly what the future repository will expose so the agent loop won't
 * change shape.
 */
export type DecisionAction = "PAY" | "REFUSE" | "ESCALATE";

export type Decision = {
  id: string;
  service: string;
  quotedMicroUsdc: bigint;
  decidedAt: string;
  action: DecisionAction;
  confidence: number;
  reason: string;
  prompt: string;
  rawResponse: string;
  receiptId?: string;
  txHash?: string;
};

export type PriceSample = {
  service: string;
  amountMicroUsdc: bigint;
  recordedAt: number;
};

const decisions: Decision[] = [];
const priceHistory = new Map<string, PriceSample[]>();

export const db = {
  recordPrice(sample: PriceSample) {
    const arr = priceHistory.get(sample.service) ?? [];
    arr.push(sample);
    if (arr.length > 50) arr.shift();
    priceHistory.set(sample.service, arr);
  },
  /** Median of the last N samples, or undefined if no history yet. */
  rollingMedian(service: string, n = 6): bigint | undefined {
    const arr = priceHistory.get(service);
    if (!arr || arr.length === 0) return undefined;
    const slice = arr.slice(-n).map((s) => s.amountMicroUsdc);
    slice.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    return slice[Math.floor(slice.length / 2)];
  },
  push(d: Decision) {
    decisions.push(d);
  },
  list(): Decision[] {
    return [...decisions];
  },
  recentRefusals(): Decision[] {
    return decisions.filter((d) => d.action === "REFUSE").slice(-5);
  },
};
