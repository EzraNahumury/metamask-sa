/**
 * Single agent tick: walk the configured service catalog, ask Venice to
 * decide, and either pay via x402 or refuse with a logged reason.
 *
 * Run:  pnpm --filter @delegate/agent run tick
 *
 * The merchants service must be running at MERCHANTS_BASE_URL.
 */
import { privateKeyToAccount } from "viem/accounts";
import { randomUUID } from "node:crypto";
import { config } from "./config.js";
import { db, type Decision } from "./db.js";
import { payMerchant } from "./pay.js";
import { Reasoner } from "./reasoning.js";

const PER_CALL_CAP_MICRO_USDC = 30_000_000n;          // $30
const WEEKLY_BUDGET_MICRO_USDC = 50_000_000n;         // $50

async function listServices(): Promise<
  Array<{ slug: string; displayName: string; normalPriceMicroUsdc: bigint }>
> {
  const r = await fetch(config.MERCHANTS_BASE_URL);
  if (!r.ok) throw new Error(`merchants index failed (${r.status})`);
  const body = (await r.json()) as {
    services: Array<{ slug: string; displayName: string; normalPriceMicroUsdc: string }>;
  };
  return body.services.map((s) => ({
    slug: s.slug,
    displayName: s.displayName,
    normalPriceMicroUsdc: BigInt(s.normalPriceMicroUsdc),
  }));
}

async function fetchQuote(slug: string): Promise<bigint> {
  const r = await fetch(`${config.MERCHANTS_BASE_URL}/${slug}/quote`);
  if (r.status !== 402) throw new Error(`expected 402 from quote, got ${r.status}`);
  const body = (await r.json()) as { accepts: Array<{ network: string; amount: string }> };
  const accept = body.accepts.find((a) => a.network === "eip155:8453");
  if (!accept) throw new Error("no eip155:8453 accept in quote");
  return BigInt(accept.amount);
}

async function main() {
  if (!config.SPIKE_PRIVATE_KEY) {
    throw new Error("SPIKE_PRIVATE_KEY missing in .env (used as the agent's signer for the demo).");
  }
  const account = privateKeyToAccount(config.SPIKE_PRIVATE_KEY as `0x${string}`);
  console.log(`agent signer: ${account.address}`);

  const reasoner = new Reasoner(account);
  const services = await listServices();
  console.log(`found ${services.length} services at ${config.MERCHANTS_BASE_URL}`);

  let weeklySpent = 0n;

  for (const svc of services) {
    // 1. Fresh quote.
    let quoted: bigint;
    try {
      quoted = await fetchQuote(svc.slug);
    } catch (e) {
      console.error(`[${svc.slug}] failed to fetch quote:`, e);
      continue;
    }
    db.recordPrice({ service: svc.slug, amountMicroUsdc: quoted, recordedAt: Date.now() });

    // 2. Reason.
    const decision = await reasoner.decide({
      service: svc.slug,
      displayName: svc.displayName,
      quotedMicroUsdc: quoted,
      allowedCallees: services.map((s) => s.slug),
      perCallCapMicroUsdc: PER_CALL_CAP_MICRO_USDC,
      weeklyBudgetMicroUsdc: WEEKLY_BUDGET_MICRO_USDC,
      weeklySpentMicroUsdc: weeklySpent,
    });
    const id = randomUUID();
    const record: Decision = {
      id,
      service: svc.slug,
      quotedMicroUsdc: quoted,
      decidedAt: new Date().toISOString(),
      action: decision.action,
      confidence: decision.confidence,
      reason: decision.reason,
      prompt: decision.prompt,
      rawResponse: decision.rawResponse,
    };
    db.push(record);

    console.log(
      `[${svc.slug}] ${decision.action} (conf=${decision.confidence.toFixed(2)}) — ${decision.reason}`,
    );

    // 3. Act.
    if (decision.action === "PAY") {
      try {
        const result = await payMerchant({
          account,
          baseUrl: config.MERCHANTS_BASE_URL,
          serviceSlug: svc.slug,
        });
        record.receiptId = result.receipt.receiptId;
        weeklySpent += result.quotedAmountMicroUsdc;
        console.log(`  -> paid, receipt ${result.receipt.receiptId}`);
      } catch (e) {
        console.error(`  -> payment failed:`, e);
      }
    }
  }

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
