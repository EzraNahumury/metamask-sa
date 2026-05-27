import { randomBytes } from "node:crypto";
import type { Account, Hex } from "viem";
import { BASE_CHAIN_ID } from "../chain/base.js";

/**
 * Venice's x402 v2 payment-requirement entry (one network).
 */
export type X402V2Requirement = {
  protocol: "x402";
  version: number;
  network: string;
  asset: string;
  amount: string;
  payTo: `0x${string}`;
  extra?: { name: string; version: string };
};

/**
 * Build and sign an EIP-3009 `transferWithAuthorization` for a Venice
 * x402 top-up, then wrap it in the x402 v2 payment payload and base64-encode
 * it for the `X-402-Payment` header.
 *
 * Notes:
 * - USDC on Base uses domain `{ name: "USD Coin", version: "2" }`. The
 *   payment-requirement payload echoes the right values under `extra`.
 * - The signing account must support `signTypedData` (privateKeyToAccount,
 *   Smart Accounts Kit local signers, etc.).
 * - `validBefore` defaults to "now + 30 minutes". Keep the window tight so
 *   a leaked payload can't be replayed long after the fact.
 */
export async function buildX402PaymentHeader(params: {
  account: Pick<Account, "address" | "signTypedData">;
  requirement: X402V2Requirement;
  x402Version: number;
  usdcContract: `0x${string}`;
  validitySeconds?: number;
}): Promise<string> {
  const { account, requirement, x402Version, usdcContract } = params;
  const validitySeconds = params.validitySeconds ?? 30 * 60;
  if (!account.signTypedData) {
    throw new Error("Account does not support signTypedData; cannot build x402 payment.");
  }

  const now = Math.floor(Date.now() / 1000);
  const validAfter = 0n;
  const validBefore = BigInt(now + validitySeconds);
  const value = BigInt(requirement.amount);
  const nonce = ("0x" + randomBytes(32).toString("hex")) as Hex;

  const domain = {
    name: requirement.extra?.name ?? "USD Coin",
    version: requirement.extra?.version ?? "2",
    chainId: BASE_CHAIN_ID,
    verifyingContract: usdcContract,
  } as const;

  const types = {
    TransferWithAuthorization: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "validAfter", type: "uint256" },
      { name: "validBefore", type: "uint256" },
      { name: "nonce", type: "bytes32" },
    ],
  } as const;

  const message = {
    from: account.address,
    to: requirement.payTo,
    value,
    validAfter,
    validBefore,
    nonce,
  };

  const signature = await account.signTypedData({
    domain,
    types,
    primaryType: "TransferWithAuthorization",
    message,
  });

  const paymentPayload = {
    x402Version,
    scheme: "exact",
    network: requirement.network,
    payload: {
      signature,
      authorization: {
        from: account.address,
        to: requirement.payTo,
        value: value.toString(),
        validAfter: validAfter.toString(),
        validBefore: validBefore.toString(),
        nonce,
      },
    },
  };
  return Buffer.from(JSON.stringify(paymentPayload)).toString("base64");
}
