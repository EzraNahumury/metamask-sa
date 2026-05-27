/**
 * Isolate which field is causing "invalid address null".
 * Send progressively richer payloads.
 */
import { encodeFunctionData } from "viem";
import { env } from "./_env.js";

function bigintReplacer(_k: string, v: unknown) {
  return typeof v === "bigint" ? v.toString() : v;
}

async function call(params: unknown, label: string) {
  const body = JSON.stringify(
    { jsonrpc: "2.0", id: 1, method: "relayer_send7710Transaction", params },
    bigintReplacer,
  );
  const r = await fetch(env.ONESHOT_RELAYER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const j = await r.json();
  console.log(`\n--- ${label} ---`);
  console.log("resp:", JSON.stringify(j).slice(0, 350));
}

const ERC20_ABI = [
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

const transferData = encodeFunctionData({
  abi: ERC20_ABI,
  functionName: "transfer",
  args: ["0xE936e8FAf4A5655469182A49a505055B71C17604", 20000n],
});

const baseTx = {
  target: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  value: "0x0",
  data: transferData,
  permissionContext: "0x00", // dummy short context to trigger downstream errors
};

// 1. Naked: no authorizationList, dummy permissionContext.
await call(
  {
    chainId: "8453",
    feeToken: env.ONESHOT_FEE_TOKEN,
    transactions: [baseTx],
  },
  "naked, dummy permissionContext",
);

// 2. With `from` on tx.
await call(
  {
    chainId: "8453",
    feeToken: env.ONESHOT_FEE_TOKEN,
    transactions: [{ ...baseTx, from: "0x5Aea061d814A72de9EE9171bE86F45f48e1E2f5d" }],
  },
  "with from on tx",
);

// 3. With authorizationList in viem shape.
await call(
  {
    chainId: "8453",
    feeToken: env.ONESHOT_FEE_TOKEN,
    authorizationList: [
      {
        address: "0x63c0c19a282a1B52b07dD5a65b58948A07DAE32B",
        chainId: 8453,
        nonce: 0,
        r: "0x0abcef0a8cb899efa3596c852880743b1e90fb99621f7edf11a79d768b512d31",
        s: "0x3397ab6ce789c3b97e561ef200a0917d215709e238357e33e0310f4bf8c9a9bd",
        v: "0x1c",
        yParity: 1,
      },
    ],
    transactions: [baseTx],
  },
  "viem-shape authorizationList",
);

// 4. With authorizationList using `contractAddress` instead of `address`.
await call(
  {
    chainId: "8453",
    feeToken: env.ONESHOT_FEE_TOKEN,
    authorizationList: [
      {
        contractAddress: "0x63c0c19a282a1B52b07dD5a65b58948A07DAE32B",
        chainId: 8453,
        nonce: 0,
        r: "0x0abcef0a8cb899efa3596c852880743b1e90fb99621f7edf11a79d768b512d31",
        s: "0x3397ab6ce789c3b97e561ef200a0917d215709e238357e33e0310f4bf8c9a9bd",
        yParity: 1,
      },
    ],
    transactions: [baseTx],
  },
  "contractAddress key",
);
