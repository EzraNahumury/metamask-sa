/**
 * Spike 05 — 1Shot webhook receiver smoke test.
 *
 * Boots a tiny Express server that prints any POST it receives, then
 * pings itself to confirm the port is reachable. The actual public-URL
 * leg requires you to run `ngrok http <WEBHOOK_PORT>` in a second
 * terminal and paste the https URL into WEBHOOK_PUBLIC_URL.
 *
 * Once WEBHOOK_PUBLIC_URL is set, the script also POSTs a synthetic
 * "TransactionConfirmed" payload to it so we know our handler shape
 * matches what 1Shot will deliver.
 *
 * Run:
 *   1.  pnpm spike:webhook
 *   2.  (in a second terminal) ngrok http 8787
 *   3.  paste the https URL into .env as WEBHOOK_PUBLIC_URL
 *   4.  rerun pnpm spike:webhook
 */
import express from "express";
import { banner, env, ok } from "./_env.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

app.post("/webhook/1shot", (req, res) => {
  console.log("\n--- inbound webhook ---");
  console.dir(req.body, { depth: null });
  console.log("------------------------");
  res.json({ received: true, at: new Date().toISOString() });
});

app.get("/health", (_req, res) => res.json({ ok: true }));

async function main() {
  banner("Spike 05 — webhook receiver");

  const server = app.listen(env.WEBHOOK_PORT, async () => {
    ok(`listening on http://localhost:${env.WEBHOOK_PORT}`);
    console.log("    POST /webhook/1shot   to receive relayer events");
    console.log("    GET  /health          for liveness");
    console.log("");

    // Self-ping to confirm Express is healthy.
    try {
      const r = await fetch(`http://localhost:${env.WEBHOOK_PORT}/health`);
      const j = await r.json();
      ok(`self health check: ${JSON.stringify(j)}`);
    } catch (e) {
      console.error("self health check failed:", e);
    }

    // If a public URL is set, send a synthetic 1Shot payload.
    if (env.WEBHOOK_PUBLIC_URL) {
      try {
        const r = await fetch(`${env.WEBHOOK_PUBLIC_URL}/webhook/1shot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "TransactionConfirmed",
            id: "synthetic-spike-05",
            chainId: env.ONESHOT_CHAIN_ID,
            txHash: "0x" + "ab".repeat(32),
            at: new Date().toISOString(),
          }),
        });
        ok(`public URL reachable: ${r.status} ${r.statusText}`);
      } catch (e) {
        console.error("public URL ping failed (is ngrok running?):", e);
      }
    } else {
      console.log("  (set WEBHOOK_PUBLIC_URL in .env to test the public leg via ngrok)");
    }
  });

  process.on("SIGINT", () => {
    console.log("\nshutting down…");
    server.close(() => process.exit(0));
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
