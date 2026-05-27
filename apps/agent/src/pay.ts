import { buildX402PaymentHeader, USDC_BASE, type X402V2Requirement } from "@delegate/core";
import type { Account } from "viem";

/**
 * Pay a merchant by:
 *   1. GETting `/<slug>/quote` (expecting HTTP 402 + payment requirements)
 *   2. Signing an EIP-3009 transferWithAuthorization
 *   3. POSTing `/<slug>/charge` with the X-402-Payment header
 *
 * The merchant verifies signature + amount + recipient and returns a receipt.
 * Onchain settlement (actually moving the USDC) happens in a later step
 * when we wire 1Shot relayer redemption — for the v1 demo we accept the
 * signed authorization as proof of intent.
 */
export async function payMerchant(opts: {
  account: Account;
  baseUrl: string;
  serviceSlug: string;
}): Promise<{
  receipt: { receiptId: string; paidBy: string; paidTo: string; amountMicroUsdc: string };
  quotedAmountMicroUsdc: bigint;
}> {
  const { account, baseUrl, serviceSlug } = opts;

  // 1. Quote.
  const quoteRes = await fetch(`${baseUrl}/${serviceSlug}/quote`);
  if (quoteRes.status !== 402) {
    throw new Error(`expected 402 from /quote, got ${quoteRes.status}`);
  }
  const quoteBody = (await quoteRes.json()) as {
    x402Version: number;
    accepts: X402V2Requirement[];
  };
  const requirement = quoteBody.accepts.find((a) => a.network === "eip155:8453");
  if (!requirement) throw new Error("merchant did not advertise eip155:8453 payment option");
  const quotedAmount = BigInt(requirement.amount);

  // 2. Sign x402 payment.
  const x402Header = await buildX402PaymentHeader({
    account,
    requirement,
    x402Version: quoteBody.x402Version,
    usdcContract: USDC_BASE,
  });

  // 3. Charge.
  const chargeRes = await fetch(`${baseUrl}/${serviceSlug}/charge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-402-Payment": x402Header,
    },
  });
  const chargeBody = await chargeRes.text();
  if (!chargeRes.ok) {
    throw new Error(`charge failed (${chargeRes.status}): ${chargeBody.slice(0, 300)}`);
  }
  const receipt = JSON.parse(chargeBody) as {
    service: string;
    receiptId: string;
    paidBy: string;
    paidTo: string;
    amountMicroUsdc: string;
  };
  return { receipt, quotedAmountMicroUsdc: quotedAmount };
}
