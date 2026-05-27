/**
 * Spike 08 — Venice x402 top-up + first inference call.
 *
 * Flow:
 *   1. SIWE-sign an authentication challenge for api.venice.ai.
 *   2. POST /x402/top-up with no payment header → receive payment requirements
 *      ({ network, asset, amount, payTo, extra: { name, version } }).
 *   3. Build an EIP-3009 USDC transferWithAuthorization typed-data message
 *      (USDC's native gasless transfer), sign it with the burner key.
 *   4. Wrap signature + authorization in the x402 v2 payment payload, base64.
 *   5. POST /x402/top-up again, now with X-402-Payment header → deposit $5.
 *   6. Verify by GET /x402/balance/{address}.
 *   7. Call POST /chat/completions with X-Sign-In-With-X (SIWE) and confirm
 *      X-Balance-Remaining header decreases.
 *
 * Real USDC spend: ~5 USDC (Venice min top-up).
 *
 * Run:  pnpm spike:venice-topup
 */
import { SiweMessage } from "siwe";
import { privateKeyToAccount } from "viem/accounts";
import { randomBytes, randomUUID } from "node:crypto";
import { banner, env, fail, ok, requireEnv } from "./_env.js";

const BASE_CHAIN_ID = 8453;
const BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
const VENICE_DOMAIN = "api.venice.ai";

type X402V2PaymentRequirement = {
  protocol: "x402";
  version: number;
  network: string;            // "eip155:8453"
  asset: string;              // USDC address
  amount: string;             // wei-like string
  payTo: `0x${string}`;
  extra?: { name: string; version: string };
};

type X402V2Accepts = {
  x402Version: number;
  accepts: X402V2PaymentRequirement[];
};

function siweHeader(account: ReturnType<typeof privateKeyToAccount>, uri: string) {
  const msg = new SiweMessage({
    domain: VENICE_DOMAIN,
    address: account.address,
    statement: "Sign in to Venice API",
    uri,
    version: "1",
    chainId: BASE_CHAIN_ID,
    nonce: randomUUID().replace(/-/g, "").slice(0, 16),
    issuedAt: new Date().toISOString(),
    expirationTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });
  return { msg, prepared: msg.prepareMessage() };
}

async function encodeSiweHeader(
  account: ReturnType<typeof privateKeyToAccount>,
  prepared: string,
) {
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

async function main() {
  banner("Spike 08 — Venice x402 top-up + first inference");

  const pk = requireEnv("SPIKE_PRIVATE_KEY") as `0x${string}`;
  const account = privateKeyToAccount(pk);
  console.log(`  EOA: ${account.address}\n`);

  // 1. Request payment requirements.
  const topUpUri = `${env.VENICE_BASE_URL}/x402/top-up`;
  const siwe1 = siweHeader(account, topUpUri);
  const siweHeader1 = await encodeSiweHeader(account, siwe1.prepared);

  const requirementsRes = await fetch(topUpUri, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Sign-In-With-X": siweHeader1 },
  });
  const requirementsBody = (await requirementsRes.json()) as X402V2Accepts;
  console.log(`  payment requirements (${requirementsRes.status}):`);
  console.dir(requirementsBody, { depth: null });

  const evm = requirementsBody.accepts.find((a) => a.network === "eip155:8453");
  if (!evm) throw new Error("Venice did not advertise an eip155:8453 (Base) payment option");
  ok(`selected requirement: ${evm.amount} units of ${evm.asset} -> ${evm.payTo}`);

  // 2. Build EIP-3009 transferWithAuthorization typed data.
  const now = Math.floor(Date.now() / 1000);
  const validAfter = 0n;
  const validBefore = BigInt(now + 60 * 30);                                // 30 min window
  const value = BigInt(evm.amount);                                         // already in token-decimals
  const nonce = ("0x" + randomBytes(32).toString("hex")) as `0x${string}`;

  const domain = {
    name: evm.extra?.name ?? "USD Coin",
    version: evm.extra?.version ?? "2",
    chainId: BASE_CHAIN_ID,
    verifyingContract: BASE_USDC,
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
    to: evm.payTo,
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
  ok(`EIP-3009 transferWithAuthorization signed (nonce=${nonce.slice(0, 18)}…)`);

  // 3. Build the x402 v2 payment payload + base64-encode.
  const paymentPayload = {
    x402Version: requirementsBody.x402Version,
    scheme: "exact",
    network: evm.network,
    payload: {
      signature,
      authorization: {
        from: account.address,
        to: evm.payTo,
        value: value.toString(),
        validAfter: validAfter.toString(),
        validBefore: validBefore.toString(),
        nonce,
      },
    },
  };
  const x402PaymentHeader = Buffer.from(JSON.stringify(paymentPayload)).toString("base64");
  ok(`x402 payment header built (${x402PaymentHeader.length} chars)`);

  // 4. Re-POST /x402/top-up with the payment header.
  const siwe2 = siweHeader(account, topUpUri);
  const siweHeader2 = await encodeSiweHeader(account, siwe2.prepared);

  const topUpRes = await fetch(topUpUri, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Sign-In-With-X": siweHeader2,
      "X-402-Payment": x402PaymentHeader,
    },
  });
  const topUpBody = await topUpRes.text();
  console.log(`\n  POST /x402/top-up (with payment) → ${topUpRes.status} ${topUpRes.statusText}`);
  console.log(`  X-Balance-Remaining: ${topUpRes.headers.get("x-balance-remaining")}`);
  try {
    console.dir(JSON.parse(topUpBody), { depth: null });
  } catch {
    console.log(`  body: ${topUpBody.slice(0, 500)}`);
  }

  if (!topUpRes.ok) {
    fail("top-up did not return 2xx; inspect the body above");
    return;
  }
  ok("top-up succeeded");

  // 5. Check balance.
  const balRes = await fetch(`${env.VENICE_BASE_URL}/x402/balance/${account.address}`);
  console.log(`\n  GET /x402/balance/${account.address} → ${balRes.status}`);
  try {
    console.dir(JSON.parse(await balRes.text()), { depth: null });
  } catch (_e) {
    /* ignore */
  }

  // 6. Make a real inference call.
  const chatUri = `${env.VENICE_BASE_URL}/chat/completions`;
  const siwe3 = siweHeader(account, chatUri);
  const siweHeader3 = await encodeSiweHeader(account, siwe3.prepared);

  const chatRes = await fetch(chatUri, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Sign-In-With-X": siweHeader3,
    },
    body: JSON.stringify({
      model: env.VENICE_TEXT_MODEL,
      messages: [
        {
          role: "user",
          content:
            "Reply in one short sentence: confirm you received this request via Venice x402.",
        },
      ],
      temperature: 0.2,
    }),
  });
  console.log(`\n  POST /chat/completions → ${chatRes.status}`);
  console.log(`  X-Balance-Remaining: ${chatRes.headers.get("x-balance-remaining")}`);
  const chatBody = await chatRes.text();
  try {
    const parsed = JSON.parse(chatBody) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const out = parsed.choices?.[0]?.message?.content;
    if (out) ok(`first paid inference: ${out.slice(0, 240)}`);
    else console.dir(parsed, { depth: null });
  } catch {
    console.log(`  body: ${chatBody.slice(0, 400)}`);
  }
}

main().catch((e) => {
  fail("spike 08 failed", e);
  process.exit(1);
});
