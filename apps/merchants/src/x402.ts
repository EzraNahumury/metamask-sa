import { verifyTypedData } from "viem";
import type { Address, Hex } from "viem";
import { BASE_CHAIN_ID, USDC_BASE } from "@delegate/core";

/**
 * Subset of the x402 v2 payment payload we accept on the merchant side. The
 * agent client signs an EIP-3009 transferWithAuthorization and sends the
 * base64-encoded JSON in the X-402-Payment header.
 */
export type X402PaymentPayload = {
  x402Version: number;
  scheme: "exact";
  network: string;
  payload: {
    signature: Hex;
    authorization: {
      from: Address;
      to: Address;
      value: string;
      validAfter: string;
      validBefore: string;
      nonce: Hex;
    };
  };
};

export function decodeX402Header(headerB64: string | undefined): X402PaymentPayload | null {
  if (!headerB64) return null;
  try {
    const json = Buffer.from(headerB64, "base64").toString("utf8");
    return JSON.parse(json) as X402PaymentPayload;
  } catch {
    return null;
  }
}

export type X402AcceptHint = {
  protocol: "x402";
  version: number;
  network: string;
  asset: Address;
  amount: string;
  payTo: Address;
  extra: { name: string; version: string };
};

/** Build the 402 body served when a request arrives without payment. */
export function build402Body(opts: { amount: bigint; payTo: Address; asset?: Address }): {
  x402Version: number;
  accepts: X402AcceptHint[];
} {
  return {
    x402Version: 2,
    accepts: [
      {
        protocol: "x402",
        version: 2,
        network: "eip155:8453",
        asset: opts.asset ?? USDC_BASE,
        amount: opts.amount.toString(),
        payTo: opts.payTo,
        extra: { name: "USD Coin", version: "2" },
      },
    ],
  };
}

export type VerifyResult =
  | { ok: true; from: Address; to: Address; value: bigint }
  | { ok: false; reason: string };

/**
 * Verifies the EIP-3009 signature inside an X-402-Payment payload. Note: we
 * don't broadcast the authorization — settlement happens once the agent's
 * facilitator (or a relayer) actually calls `transferWithAuthorization` on
 * USDC. For the demo flow we just confirm the signature is valid and the
 * amount/recipient match what we quoted.
 */
export async function verifyX402Payment(opts: {
  payment: X402PaymentPayload;
  expectedTo: Address;
  expectedAmount: bigint;
  usdcContract?: Address;
}): Promise<VerifyResult> {
  const usdc = opts.usdcContract ?? USDC_BASE;
  const { authorization, signature } = opts.payment.payload;

  if (authorization.to.toLowerCase() !== opts.expectedTo.toLowerCase()) {
    return { ok: false, reason: "payment to wrong recipient" };
  }
  const value = BigInt(authorization.value);
  if (value !== opts.expectedAmount) {
    return { ok: false, reason: `value mismatch (got ${value}, expected ${opts.expectedAmount})` };
  }
  const validBefore = BigInt(authorization.validBefore);
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (validBefore < now) {
    return { ok: false, reason: "authorization expired" };
  }

  const valid = await verifyTypedData({
    address: authorization.from,
    domain: {
      name: "USD Coin",
      version: "2",
      chainId: BASE_CHAIN_ID,
      verifyingContract: usdc,
    },
    types: {
      TransferWithAuthorization: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "validAfter", type: "uint256" },
        { name: "validBefore", type: "uint256" },
        { name: "nonce", type: "bytes32" },
      ],
    },
    primaryType: "TransferWithAuthorization",
    message: {
      from: authorization.from,
      to: authorization.to,
      value,
      validAfter: BigInt(authorization.validAfter),
      validBefore,
      nonce: authorization.nonce,
    },
    signature,
  });
  if (!valid) return { ok: false, reason: "signature failed verification" };

  return { ok: true, from: authorization.from, to: opts.expectedTo, value };
}
