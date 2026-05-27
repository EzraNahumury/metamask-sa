/**
 * Spike 02 — 1Shot Permissionless Relayer reachability + capability test.
 *
 * Verifies via JSON-RPC that:
 *   1. The relayer responds at all.
 *   2. Our target chain (ONESHOT_CHAIN_ID) is supported.
 *   3. We can pull a fresh fee quote in our chosen fee token.
 *
 * We do NOT broadcast a real tx here — that's spike 03. This is a cheap
 * health check that should pass in <2 seconds.
 *
 * Run:  pnpm spike:1shot
 */
import { banner, env, fail, ok } from "./_env.js";

type RpcReq = { jsonrpc: "2.0"; id: number; method: string; params: unknown };
type RpcRes<T> = { jsonrpc: "2.0"; id: number; result?: T; error?: { code: number; message: string } };

async function rpc<T>(method: string, params: unknown): Promise<T> {
  const body: RpcReq = { jsonrpc: "2.0", id: Date.now(), method, params };
  const res = await fetch(env.ONESHOT_RELAYER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${await res.text()}`);
  }
  const json = (await res.json()) as RpcRes<T>;
  if (json.error) {
    throw new Error(`RPC ${method} → ${json.error.code}: ${json.error.message}`);
  }
  if (json.result === undefined) {
    throw new Error(`RPC ${method} returned no result`);
  }
  return json.result;
}

async function getCapabilities() {
  const result = await rpc<unknown>("relayer_getCapabilities", [String(env.ONESHOT_CHAIN_ID)]);
  ok(`relayer_getCapabilities responded for chain ${env.ONESHOT_CHAIN_ID}`);
  console.log("    ↳ capabilities:", JSON.stringify(result).slice(0, 400));
  return result;
}

async function getFeeData() {
  const result = await rpc<unknown>("relayer_getFeeData", {
    chainId: String(env.ONESHOT_CHAIN_ID),
    token: env.ONESHOT_FEE_TOKEN,
  });
  ok(`relayer_getFeeData returned a quote in token ${env.ONESHOT_FEE_TOKEN}`);
  console.log("    ↳ fee quote:", JSON.stringify(result).slice(0, 400));
  return result;
}

async function main() {
  banner("Spike 02 — 1Shot Permissionless Relayer health check");
  console.log(`  endpoint: ${env.ONESHOT_RELAYER_URL}`);
  console.log(`  chainId:  ${env.ONESHOT_CHAIN_ID}`);
  console.log(`  feeToken: ${env.ONESHOT_FEE_TOKEN}\n`);

  try {
    await getCapabilities();
  } catch (e) {
    fail("relayer_getCapabilities failed", e);
  }
  try {
    await getFeeData();
  } catch (e) {
    fail("relayer_getFeeData failed (this may simply mean fee token not supported on this chain)", e);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
