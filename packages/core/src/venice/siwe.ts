import { SiweMessage } from "siwe";
import { randomUUID } from "node:crypto";
import type { Account } from "viem";
import { BASE_CHAIN_ID } from "../chain/base.js";

const VENICE_DOMAIN = "api.venice.ai";

/**
 * Build, sign, and base64-encode a Sign-In-With-X header for Venice. Each
 * Venice API call requires a fresh token (10-minute expiry).
 */
export async function buildVeniceSiweHeader(
  account: Pick<Account, "address" | "signMessage">,
  resourceUri: string,
): Promise<string> {
  const msg = new SiweMessage({
    domain: VENICE_DOMAIN,
    address: account.address,
    statement: "Sign in to Venice API",
    uri: resourceUri,
    version: "1",
    chainId: BASE_CHAIN_ID,
    nonce: randomUUID().replace(/-/g, "").slice(0, 16),
    issuedAt: new Date().toISOString(),
    expirationTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });
  const prepared = msg.prepareMessage();
  if (!account.signMessage) {
    throw new Error("Account does not support signMessage; cannot SIWE-auth to Venice.");
  }
  const signature = await account.signMessage({ message: prepared });
  return Buffer.from(
    JSON.stringify({
      address: account.address,
      message: prepared,
      signature,
      timestamp: Date.now(),
      chainId: BASE_CHAIN_ID,
    }),
  ).toString("base64");
}
