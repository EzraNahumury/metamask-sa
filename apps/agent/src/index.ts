/**
 * Long-running agent. Boots an HTTP server (Express + SSE) and a
 * background tick loop. The frontend subscribes to /events to render
 * decisions live; the loop drives the action.
 */
import { config } from "./config.js";
import { runTick } from "./loop.js";
import { buildServer } from "./server.js";

async function tickLoop() {
  while (true) {
    try {
      await runTick();
    } catch (e) {
      console.error("tick error:", e);
    }
    await new Promise((r) => setTimeout(r, config.AGENT_TICK_SECONDS * 1000));
  }
}

async function main() {
  const app = buildServer();
  app.listen(config.AGENT_PORT, () => {
    console.log(`agent listening at http://localhost:${config.AGENT_PORT}`);
    console.log(`  GET  /decisions       full decision log`);
    console.log(`  GET  /events          SSE stream`);
    console.log(`  POST /admin/run-tick  trigger one tick`);
    console.log(`tick interval: ${config.AGENT_TICK_SECONDS}s — merchants=${config.MERCHANTS_BASE_URL}`);
  });
  // Run ticks in the background so the HTTP server is always responsive.
  void tickLoop();
}

void main();
