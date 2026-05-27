/**
 * Pure tick implementation. Walks the merchant catalog, asks Venice to
 * decide, optionally pays. Emits events on the shared bus so any HTTP/SSE
 * consumer can observe in real time.
 */
import { privateKeyToAccount } from "viem/accounts";
import { createPublicClient, http } from "viem";
import { randomUUID } from "node:crypto";
import { base, OneShotRelayerClient, settleOnchain } from "@delegate/core";
import { config } from "./config.js";
import { db, type Decision } from "./db.js";
import { bus } from "./events.js";
import { payMerchant } from "./pay.js";
import { Reasoner } from "./reasoning.js";

const PER_CALL_CAP_MICRO_USDC = 30_000_000n;          // $30
const WEEKLY_BUDGET_MICRO_USDC = 50_000_000n;         // $50

export type MerchantSummary = { slug: string; displayName: string; normalPriceMicroUsdc: bigint };

export async function listServices(baseUrl: string): Promise<MerchantSummary[]> {
  const r = await fetch(baseUrl);
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

async function fetchQuote(baseUrl: string, slug: string): Promise<bigint> {
  const r = await fetch(`${baseUrl}/${slug}/quote`);
  if (r.status !== 402) throw new Error(`expected 402 from quote, got ${r.status}`);
  const body = (await r.json()) as { accepts: Array<{ network: string; amount: string }> };
  const accept = body.accepts.find((a) => a.network === "eip155:8453");
  if (!accept) throw new Error("no eip155:8453 accept in quote");
  return BigInt(accept.amount);
}

export type RunTickOptions = {
  /** Override merchant URL (default: config.MERCHANTS_BASE_URL). */
  merchantsBaseUrl?: string;
  /** Only process this service slug if given. */
  onlySlug?: string;
};

export async function runTick(options: RunTickOptions = {}): Promise<Decision[]> {
  if (!config.SPIKE_PRIVATE_KEY) {
    throw new Error("SPIKE_PRIVATE_KEY missing in .env");
  }
  const account = privateKeyToAccount(config.SPIKE_PRIVATE_KEY as `0x${string}`);
  const baseUrl = options.merchantsBaseUrl ?? config.MERCHANTS_BASE_URL;
  const reasoner = new Reasoner(account);
  const publicClient = createPublicClient({
    chain: base,
    transport: http(config.CHAIN_RPC_URL),
  });
  const relayer = new OneShotRelayerClient();

  bus.emitEvent({ type: "tick.started", at: new Date().toISOString() });

  const services = await listServices(baseUrl);
  const targets = options.onlySlug ? services.filter((s) => s.slug === options.onlySlug) : services;

  let weeklySpent = 0n;
  const newDecisions: Decision[] = [];

  for (const svc of targets) {
    let quoted: bigint;
    try {
      quoted = await fetchQuote(baseUrl, svc.slug);
    } catch (e) {
      console.error(`[${svc.slug}] quote failed:`, e);
      continue;
    }
    db.recordPrice({ service: svc.slug, amountMicroUsdc: quoted, recordedAt: Date.now() });

    const decision = await reasoner.decide({
      service: svc.slug,
      displayName: svc.displayName,
      quotedMicroUsdc: quoted,
      allowedCallees: services.map((s) => s.slug),
      perCallCapMicroUsdc: PER_CALL_CAP_MICRO_USDC,
      weeklyBudgetMicroUsdc: WEEKLY_BUDGET_MICRO_USDC,
      weeklySpentMicroUsdc: weeklySpent,
    });
    const record: Decision = {
      id: randomUUID(),
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
    bus.emitEvent({ type: "decision.recorded", decision: record });
    newDecisions.push(record);
    console.log(
      `[${svc.slug}] ${decision.action} (conf=${decision.confidence.toFixed(2)}) — ${decision.reason}`,
    );

    if (decision.action === "PAY") {
      try {
        const result = await payMerchant({
          account,
          baseUrl,
          serviceSlug: svc.slug,
        });
        record.receiptId = result.receipt.receiptId;
        weeklySpent += result.quotedAmountMicroUsdc;
        bus.emitEvent({
          type: "payment.succeeded",
          service: svc.slug,
          receiptId: result.receipt.receiptId,
          decisionId: record.id,
        });
        console.log(`  -> paid, receipt ${result.receipt.receiptId}`);

        // Optional onchain settlement: a tiny USDC transfer via 1Shot 7710 so
        // the demo gets a real basescan link per PAY without burning the
        // whole budget. Toggle via ONCHAIN_SETTLEMENT_MODE.
        if (config.ONCHAIN_SETTLEMENT_MODE === "dust") {
          try {
            const settle = await settleOnchain({
              publicClient,
              account,
              relayer,
              recipient: config.SETTLEMENT_RECIPIENT as `0x${string}`,
              amountMicroUsdc: config.ONCHAIN_DUST_MICRO_USDC,
            });
            record.txHash = settle.txHash;
            bus.emitEvent({
              type: "payment.settled",
              service: svc.slug,
              decisionId: record.id,
              txHash: settle.txHash,
              amountMicroUsdc: settle.amountMicroUsdc.toString(),
            });
            console.log(
              `  -> settled onchain (${settle.includedUpgrade ? "with upgrade, " : ""}${settle.amountMicroUsdc} micro-USDC) tx ${settle.txHash}`,
            );
          } catch (e) {
            console.error(`  -> onchain settlement failed:`, e);
          }
        }
      } catch (e) {
        const reason = e instanceof Error ? e.message : String(e);
        bus.emitEvent({ type: "payment.failed", service: svc.slug, reason, decisionId: record.id });
        console.error(`  -> payment failed:`, reason);
      }
    }
  }

  bus.emitEvent({
    type: "tick.finished",
    at: new Date().toISOString(),
    decisions: newDecisions.length,
  });
  return newDecisions;
}
