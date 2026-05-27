export type DecisionAction = "PAY" | "REFUSE" | "ESCALATE";

export type Decision = {
  id: string;
  service: string;
  quotedMicroUsdc: string;
  decidedAt: string;
  action: DecisionAction;
  confidence: number;
  reason: string;
  prompt: string;
  rawResponse: string;
  receiptId?: string;
  txHash?: string;
};

export type MerchantService = {
  slug: string;
  displayName: string;
  normalPriceMicroUsdc: string;
};

export type AgentEvent =
  | { type: "tick.started"; at: string }
  | { type: "tick.finished"; at: string; decisions: number }
  | { type: "decision.recorded"; decision: Decision }
  | { type: "payment.succeeded"; service: string; receiptId: string; decisionId: string }
  | { type: "payment.failed"; service: string; reason: string; decisionId: string }
  | {
      type: "payment.settled";
      service: string;
      decisionId: string;
      txHash: string;
      amountMicroUsdc: string;
    };
