import express, { type Request, type Response } from "express";
import cors from "cors";
import { config } from "./config.js";
import { db } from "./db.js";
import { bus, type AgentEvent } from "./events.js";
import { runTick } from "./loop.js";

function serializeDecision(d: ReturnType<typeof db.list>[number]) {
  return {
    ...d,
    quotedMicroUsdc: d.quotedMicroUsdc.toString(),
  };
}

function serializeEvent(e: AgentEvent) {
  if (e.type === "decision.recorded") {
    return { ...e, decision: serializeDecision(e.decision) };
  }
  return e;
}

export function buildServer() {
  const app = express();
  app.use(cors({ origin: config.AGENT_CORS_ORIGIN }));
  app.use(express.json({ limit: "256kb" }));

  app.get("/", (_req, res) => {
    res.json({
      service: "delegate-agent",
      merchantsBaseUrl: config.MERCHANTS_BASE_URL,
      tickIntervalSeconds: config.AGENT_TICK_SECONDS,
    });
  });

  app.get("/decisions", (_req, res) => {
    res.json(db.list().map(serializeDecision));
  });

  /**
   * Server-Sent Events stream. The frontend opens this once and gets
   * every tick/decision/payment event live. Heartbeat every 15 s keeps
   * proxies from closing the connection.
   */
  app.get("/events", (req: Request, res: Response) => {
    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.flushHeaders?.();
    res.write(`event: hello\ndata: ${JSON.stringify({ at: new Date().toISOString() })}\n\n`);

    const off = bus.onEvent((ev) => {
      res.write(`event: ${ev.type}\ndata: ${JSON.stringify(serializeEvent(ev))}\n\n`);
    });
    const ping = setInterval(() => res.write(`event: ping\ndata: {}\n\n`), 15000);

    req.on("close", () => {
      off();
      clearInterval(ping);
    });
  });

  /** Trigger a single tick on demand (demo button). */
  app.post("/admin/run-tick", async (_req, res) => {
    try {
      const decisions = await runTick();
      res.json({ ranAt: new Date().toISOString(), decisionCount: decisions.length });
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
    }
  });

  return app;
}
