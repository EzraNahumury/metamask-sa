/**
 * Spike 06 — Venice x402 inference, paid from a wallet (no API key, no
 * Venice account, no credit card).
 *
 * Flow:
 *   1. Build an EIP-4361 SIWE message scoped to api.venice.ai on Base.
 *   2. Sign it with our burner private key.
 *   3. POST /x402/top-up with an empty body to ask Venice for payment
 *      requirements (receiverWallet, USDC token, amount, network).
 *   4. (Day-1) Build a signed USDC transfer authorization via the x402 SDK
 *      and resubmit with the X-402-Payment header to deposit credits.
 *   5. Call /chat/completions with the X-Sign-In-With-X header so the
 *      pre-paid credit is consumed.
 *
 * What this spike actually does today:
 *   - Steps 1-3 end-to-end (no funds moved).
 *   - Inspects the payment-requirements payload so we know exactly what
 *     a real top-up needs to send.
 *   - Optionally hits /x402/balance/{address} to read current balance.
 *
 * Run:  pnpm spike:venicex402
 */
import { SiweMessage } from "siwe";
import { privateKeyToAccount } from "viem/accounts";
import { randomUUID } from "node:crypto";
import { banner, env, fail, ok, requireEnv } from "./_env.js";

const BASE_CHAIN_ID = 8453;
const VENICE_DOMAIN = "api.venice.ai";

function buildSiweHeader(account: ReturnType<typeof privateKeyToAccount>) {
  const message = new SiweMessage({
    domain: VENICE_DOMAIN,
    address: account.address,
    statement: "Sign in to Venice API",
    uri: `https://${VENICE_DOMAIN}/api/v1/x402/top-up`,
    version: "1",
    chainId: BASE_CHAIN_ID,
    nonce: randomUUID().replace(/-/g, "").slice(0, 16),
    issuedAt: new Date().toISOString(),
    expirationTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });
  return { message, prepared: message.prepareMessage() };
}

async function encodeSiweHeader(account: ReturnType<typeof privateKeyToAccount>, prepared: string) {
  const signature = await account.signMessage({ message: prepared });
  const payload = {
    address: account.address,
    message: prepared,
    signature,
    timestamp: Date.now(),
    chainId: BASE_CHAIN_ID,
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

async function venicePost(path: string, headers: Record<string, string>) {
  const url = `${env.VENICE_BASE_URL}${path}`;
  const r = await fetch(url, { method: "POST", headers });
  const text = await r.text();
  return { status: r.status, statusText: r.statusText, body: text };
}

async function veniceGet(path: string) {
  const url = `${env.VENICE_BASE_URL}${path}`;
  const r = await fetch(url);
  const text = await r.text();
  return { status: r.status, statusText: r.statusText, body: text };
}

async function main() {
  banner("Spike 06 — Venice x402 (SIWE auth + payment requirements)");

  const pk = requireEnv("SPIKE_PRIVATE_KEY") as `0x${string}`;
  const account = privateKeyToAccount(pk);
  console.log(`  burner address: ${account.address}\n`);

  // 1. Build SIWE message.
  const { message, prepared } = buildSiweHeader(account);
  console.log("  SIWE message body:");
  for (const line of prepared.split("\n")) console.log("    " + line);
  console.log();

  // 2. Sign and base64-encode.
  const headerB64 = await encodeSiweHeader(account, prepared);
  ok(`signed and base64-encoded SIWE header (${headerB64.length} chars)`);

  // 3. Hit /x402/top-up with NO X-402-Payment header → expect payment requirements.
  const topUpRes = await venicePost("/x402/top-up", {
    "Content-Type": "application/json",
    "X-Sign-In-With-X": headerB64,
  });
  console.log(`\n  POST /x402/top-up → ${topUpRes.status} ${topUpRes.statusText}`);
  try {
    const parsed = JSON.parse(topUpRes.body);
    console.dir(parsed, { depth: null });
    ok("got payment-requirements payload (this is what a real top-up will sign over)");
  } catch {
    console.log("  body:", topUpRes.body.slice(0, 400));
  }

  // 4. Optionally check current balance.
  const balRes = await veniceGet(`/x402/balance/${account.address}`);
  console.log(`\n  GET /x402/balance/${account.address} → ${balRes.status} ${balRes.statusText}`);
  try {
    console.dir(JSON.parse(balRes.body), { depth: null });
  } catch {
    console.log("  body:", balRes.body.slice(0, 400));
  }

  console.log(
    "\n  Next step (Day-1): use the x402 SDK to sign a USDC transfer on Base\n" +
      "  for the amount in the payment requirements, send it as X-402-Payment,\n" +
      "  then call /chat/completions etc. with X-Sign-In-With-X as auth.",
  );
  // referenced so TS doesn't complain about an unused destructure
  void message;
}

main().catch((e) => {
  fail("spike 06 failed", e);
  process.exit(1);
});
