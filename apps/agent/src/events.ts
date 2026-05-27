import { EventEmitter } from "node:events";
import type { Decision } from "./db.js";

export type AgentEvent =
  | { type: "tick.started"; at: string }
  | { type: "tick.finished"; at: string; decisions: number }
  | { type: "decision.recorded"; decision: Decision }
  | { type: "payment.succeeded"; service: string; receiptId: string; decisionId: string }
  | { type: "payment.failed"; service: string; reason: string; decisionId: string }
  | { type: "payment.settled"; service: string; decisionId: string; txHash: string; amountMicroUsdc: string };

class TypedBus extends EventEmitter {
  emitEvent(ev: AgentEvent) {
    this.emit("event", ev);
  }
  onEvent(handler: (ev: AgentEvent) => void) {
    this.on("event", handler);
    return () => this.off("event", handler);
  }
}

export const bus = new TypedBus();
