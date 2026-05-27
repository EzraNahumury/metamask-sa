/**
 * One-shot tick runner — same logic the server uses, but blocks until the
 * pass is complete and exits. Useful for CLI demos and CI.
 *
 *   pnpm --filter @delegate/agent run tick
 */
import { db } from "./db.js";
import { runTick } from "./loop.js";

async function main() {
  await runTick();
  console.log("\ndecision log:");
  for (const d of db.list()) {
    console.log(
      `  ${d.decidedAt}  ${d.service.padEnd(14)} ${d.action.padEnd(8)} conf=${d.confidence.toFixed(2)}  ${d.reason}`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
