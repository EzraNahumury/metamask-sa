import { env } from "./_env.js";

async function call(method: string, params: unknown = [], id = 1) {
  const r = await fetch(env.ONESHOT_RELAYER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  return r.json();
}

// Common JSON-RPC discovery methods.
for (const m of [
  "rpc_methods",
  "rpc_listMethods",
  "relayer_listMethods",
  "system.methods",
  "discover",
  "introspect",
]) {
  console.log(`${m}:`, JSON.stringify(await call(m)).slice(0, 300));
}

// Likely method names for 7702 upgrade or general send.
for (const m of [
  "relayer_send7702Transaction",
  "relayer_upgradeAccount",
  "relayer_sendTransaction",
  "relayer_sendTransactionMultichain",
  "relayer_send7710TransactionMultichain",
  "relayer_send",
  "relayer_authorize",
  "relayer_estimate",
]) {
  console.log(`${m}:`, JSON.stringify(await call(m, [])).slice(0, 300));
}
