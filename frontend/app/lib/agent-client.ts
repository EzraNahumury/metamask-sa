import type { AgentEvent, Decision, MerchantService } from "./types";

export const AGENT_URL =
  process.env.NEXT_PUBLIC_AGENT_URL ?? "http://localhost:4030";
export const MERCHANTS_URL =
  process.env.NEXT_PUBLIC_MERCHANTS_URL ?? "http://localhost:4021";

export async function fetchDecisions(): Promise<Decision[]> {
  const r = await fetch(`${AGENT_URL}/decisions`, { cache: "no-store" });
  if (!r.ok) throw new Error(`agent /decisions failed: ${r.status}`);
  return r.json();
}

export async function fetchServices(): Promise<MerchantService[]> {
  const r = await fetch(MERCHANTS_URL, { cache: "no-store" });
  if (!r.ok) throw new Error(`merchants / failed: ${r.status}`);
  const body = (await r.json()) as { services: MerchantService[] };
  return body.services;
}

export async function triggerTick(): Promise<{ ranAt: string; decisionCount: number }> {
  const r = await fetch(`${AGENT_URL}/admin/run-tick`, { method: "POST" });
  if (!r.ok) throw new Error(`run-tick failed: ${r.status}`);
  return r.json();
}

export async function armAnomaly(slug: string): Promise<void> {
  const r = await fetch(`${MERCHANTS_URL}/admin/arm-anomaly/${slug}`, { method: "POST" });
  if (!r.ok) throw new Error(`arm-anomaly failed: ${r.status}`);
}

/**
 * Subscribe to the agent's Server-Sent Events stream. Returns a cleanup
 * function. Survives short network blips automatically (browser reconnects).
 */
export function subscribeAgentEvents(handler: (ev: AgentEvent) => void): () => void {
  const es = new EventSource(`${AGENT_URL}/events`);
  const onMessage = (e: MessageEvent) => {
    try {
      const ev = JSON.parse(e.data) as AgentEvent;
      handler(ev);
    } catch {
      // ignore malformed
    }
  };
  const types: AgentEvent["type"][] = [
    "tick.started",
    "tick.finished",
    "decision.recorded",
    "payment.succeeded",
    "payment.failed",
  ];
  for (const t of types) es.addEventListener(t, onMessage as EventListener);
  return () => {
    for (const t of types) es.removeEventListener(t, onMessage as EventListener);
    es.close();
  };
}
