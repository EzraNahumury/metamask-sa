/**
 * Long-running entry point. Runs a tick, sleeps for AGENT_TICK_SECONDS,
 * repeats. For Day 3 we'll add an HTTP server + SSE endpoint so the
 * frontend can stream decisions; for now stdout is the UI.
 */
import { config } from "./config.js";

async function runOnce() {
  const mod = await import("./tick.js");
  void mod; // tick.ts runs as a side effect
}

async function main() {
  console.log(`agent up — tick every ${config.AGENT_TICK_SECONDS}s, merchants=${config.MERCHANTS_BASE_URL}`);
  while (true) {
    try {
      await runOnce();
    } catch (e) {
      console.error("tick failed:", e);
    }
    await new Promise((r) => setTimeout(r, config.AGENT_TICK_SECONDS * 1000));
  }
}

void main();
