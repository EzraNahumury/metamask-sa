/**
 * Reverse-engineer the actual 1Shot relayer_send7710Transaction param shape.
 * Send progressively more complete payloads and let the relayer tell us
 * what's missing.
 */
import { env } from "./_env.js";

function bigintReplacer(_k: string, v: unknown) {
  return typeof v === "bigint" ? v.toString() : v;
}

async function call(method: string, params: unknown) {
  const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }, bigintReplacer);
  const r = await fetch(env.ONESHOT_RELAYER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const j = await r.json();
  return j;
}

const probes: Array<{ label: string; params: unknown }> = [
  { label: "empty array params", params: [] },
  { label: "empty object params", params: {} },
  { label: "just chainId", params: { chainId: "8453" } },
  {
    label: "transactions key, empty array",
    params: { chainId: "8453", transactions: [] },
  },
  {
    label: "one transaction, minimal",
    params: {
      chainId: "8453",
      transactions: [
        { target: "0x5Aea061d814A72de9EE9171bE86F45f48e1E2f5d", value: "0x0", data: "0x" },
      ],
    },
  },
  {
    label: "with feeToken",
    params: {
      chainId: "8453",
      feeToken: env.ONESHOT_FEE_TOKEN,
      transactions: [
        { target: "0x5Aea061d814A72de9EE9171bE86F45f48e1E2f5d", value: "0x0", data: "0x" },
      ],
    },
  },
];

for (const { label, params } of probes) {
  console.log(`\n--- ${label} ---`);
  console.log("params:", JSON.stringify(params).slice(0, 200));
  const res = await call("relayer_send7710Transaction", params);
  console.log("response:", JSON.stringify(res).slice(0, 500));
}
