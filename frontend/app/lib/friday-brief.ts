import { AGENT_URL } from "./agent-client";
import type { Decision } from "./types";

export type FridayBrief = {
  headline: string;
  summary: string;
  spendPaidUsd: number;
  spendRefusedUsd: number;
  cancellationSuggestions: Array<{ service: string; reason: string }>;
  voiceScript: string;
  generatedAt: string;
  weekStart: string;
  weekEnd: string;
  chartImageBase64: string | null;
  audioBase64: string | null;
  audioMimeType: string;
  decisions: Decision[];
  stats: {
    decisionCount: number;
    payCount: number;
    refuseCount: number;
    escalateCount: number;
    txHashCount: number;
    receiptCount: number;
  };
};

export async function fetchFridayBrief(): Promise<FridayBrief> {
  const r = await fetch(`${AGENT_URL}/friday-brief`, { cache: "no-store" });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    throw new Error(`friday brief failed (${r.status}): ${body.slice(0, 300)}`);
  }
  return r.json();
}
