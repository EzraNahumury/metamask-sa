import { VeniceClient } from "@delegate/core";
import type { Account } from "viem";
import { config } from "./config.js";
import { db, type DecisionAction } from "./db.js";

const SYSTEM_PROMPT = `You are DeleGate.AI, a chief-of-staff agent for onchain money.
You manage a delegated USDC budget on a MetaMask Smart Account.
For each invoice you decide one of: PAY | REFUSE | ESCALATE.
REFUSE if:
  - quoted price > 1.5x the rolling median of recent invoices for this service
  - the service is not in the allowed callees list
  - the per-call cap would be exceeded
  - the weekly budget would be exceeded
PAY only if all caveats and rules are satisfied AND quoted price looks reasonable.
ESCALATE if confidence < 0.7 or signals are mixed.
ALWAYS respond with strict JSON:
{
  "action": "PAY" | "REFUSE" | "ESCALATE",
  "confidence": <0..1>,
  "reason": "<one sentence>"
}`;

export type ReasoningInput = {
  service: string;
  displayName: string;
  quotedMicroUsdc: bigint;
  allowedCallees: string[];
  perCallCapMicroUsdc: bigint;
  weeklyBudgetMicroUsdc: bigint;
  weeklySpentMicroUsdc: bigint;
};

export type ReasoningResult = {
  action: DecisionAction;
  confidence: number;
  reason: string;
  prompt: string;
  rawResponse: string;
};

function toUsd(micro: bigint): string {
  const n = Number(micro) / 1e6;
  return `$${n.toFixed(2)}`;
}

export class Reasoner {
  private venice: VeniceClient;
  constructor(account: Account) {
    this.venice = new VeniceClient({ account });
  }

  async decide(input: ReasoningInput): Promise<ReasoningResult> {
    const median = db.rollingMedian(input.service);
    const recentRefusals = db.recentRefusals().map((d) => ({
      service: d.service,
      reason: d.reason,
      decidedAt: d.decidedAt,
    }));

    const userPrompt = JSON.stringify(
      {
        service: input.displayName,
        quotedUsd: toUsd(input.quotedMicroUsdc),
        rollingMedianUsd: median ? toUsd(median) : null,
        allowedCallees: input.allowedCallees,
        perCallCapUsd: toUsd(input.perCallCapMicroUsdc),
        weeklyBudgetUsd: toUsd(input.weeklyBudgetMicroUsdc),
        weeklySpentUsd: toUsd(input.weeklySpentMicroUsdc),
        recentRefusals,
      },
      null,
      2,
    );

    const completion = await this.venice.chat({
      model: config.VENICE_TEXT_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    let parsed: { action?: string; confidence?: number; reason?: string } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Model misbehaved; fall back to ESCALATE so a human reviews.
      return {
        action: "ESCALATE",
        confidence: 0,
        reason: `Could not parse model output as JSON. Raw: ${raw.slice(0, 200)}`,
        prompt: userPrompt,
        rawResponse: raw,
      };
    }

    const action: DecisionAction =
      parsed.action === "PAY" || parsed.action === "REFUSE" || parsed.action === "ESCALATE"
        ? parsed.action
        : "ESCALATE";
    return {
      action,
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0,
      reason: typeof parsed.reason === "string" ? parsed.reason : "(no reason given)",
      prompt: userPrompt,
      rawResponse: raw,
    };
  }
}
