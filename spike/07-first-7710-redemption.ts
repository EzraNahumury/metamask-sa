/**
 * Spike 07 — First end-to-end ERC-7710 redemption on Base, with the
 * ERC-7702 upgrade riding in-flight via 1Shot's permissionless relayer.
 *
 * Flow (in one tx):
 *   1. Sign an ERC-7702 authorization that installs the
 *      EIP7702StatelessDeleGator implementation on the EOA.
 *   2. Create a delegation: smart-account -> 1Shot relayer's targetAddress,
 *      scoped to "may transfer N USDC to 1Shot's feeCollector".
 *   3. Sign the delegation with the smart-account's signer.
 *   4. Encode the signed delegation as `permissionContext`.
 *   5. Build the execution: USDC.transfer(feeCollector, feeAmount).
 *   6. Submit relayer_send7710Transaction with authorizationList +
 *      transactions: [{ target, value, data, permissionContext }].
 *   7. Poll relayer_getStatus until CONFIRMED, then verify code is installed.
 *
 * This is the first real $-spending spike. Expected cost: roughly the
 * 1Shot fee for one tx on Base (minFee ~$0.01 USDC + gas-equivalent in USDC).
 *
 * Run:  pnpm spike:7710
 */
import { createPublicClient, defineChain, encodeFunctionData, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  Implementation,
  createDelegation,
  toMetaMaskSmartAccount,
} from "@metamask/smart-accounts-kit";
import { DELEGATOR_CONTRACTS } from "@metamask/delegation-deployments";
import { banner, env, fail, ok, requireEnv } from "./_env.js";

const base = defineChain({
  id: 8453,
  name: "Base",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://mainnet.base.org"] } },
  blockExplorers: { default: { name: "BaseScan", url: "https://basescan.org" } },
});

const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

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
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

type RpcRes<T> = { jsonrpc: "2.0"; id: number; result?: T; error?: { code: number; message: string } };

function bigintReplacer(_k: string, v: unknown) {
  return typeof v === "bigint" ? v.toString() : v;
}

async function rpc<T>(method: string, params: unknown): Promise<T> {
  const body = JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }, bigintReplacer);
  const res = await fetch(env.ONESHOT_RELAYER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${await res.text()}`);
  const json = (await res.json()) as RpcRes<T>;
  if (json.error) throw new Error(`${method} → ${json.error.code}: ${json.error.message}`);
  if (json.result === undefined) throw new Error(`${method} returned no result`);
  return json.result;
}

async function main() {
  banner("Spike 07 — first 7710 redemption + 7702 upgrade on Base");

  const pk = requireEnv("SPIKE_PRIVATE_KEY") as `0x${string}`;
  const account = privateKeyToAccount(pk);
  console.log(`  EOA address:   ${account.address}`);

  const publicClient = createPublicClient({
    chain: base,
    transport: http(env.CHAIN_RPC_URL),
  });

  // 1. Check the EOA already has USDC balance (we bridged earlier).
  const balance = (await publicClient.readContract({
    address: USDC_BASE,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [account.address],
  })) as bigint;
  ok(`USDC balance: ${Number(balance) / 1e6} USDC`);
  if (balance === 0n) throw new Error("EOA has 0 USDC on Base. Bridge first.");

  // 2. Get fresh fee quote from 1Shot.
  type FeeQuote = {
    chainId: string;
    token: { decimals: number; address: string; symbol: string; name: string };
    rate: number;
    minFee: string;
    expiry: number;
    gasPrice: string;
    feeCollector: `0x${string}`;
    targetAddress: `0x${string}`;
    context: string;
  };
  const feeData = await rpc<FeeQuote>("relayer_getFeeData", {
    chainId: String(base.id),
    token: env.ONESHOT_FEE_TOKEN,
  });
  ok(`fee quote: minFee=${feeData.minFee} ${feeData.token.symbol}, feeCollector=${feeData.feeCollector}, targetAddress=${feeData.targetAddress}`);

  // 3. Build the Stateless7702 smart account object.
  const smartAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Stateless7702,
    address: account.address,
    signer: { account },
  });
  ok(`smart account: ${smartAccount.address}`);

  // 4. Resolve the delegator implementation.
  const implAddress = DELEGATOR_CONTRACTS["1.3.0"]?.[base.id]?.[
    "EIP7702StatelessDeleGatorImpl"
  ] as `0x${string}` | undefined;
  if (!implAddress) throw new Error("EIP7702StatelessDeleGatorImpl not found in deployments");
  console.log(`  delegator impl: ${implAddress}`);

  // 5. Sign the 7702 authorization.
  const nonce = await publicClient.getTransactionCount({ address: account.address });
  const auth = await account.signAuthorization({
    chainId: base.id,
    contractAddress: implAddress,
    nonce,
  });
  ok(`signed 7702 authorization (nonce=${nonce})`);

  // 6. Build the delegation.
  //    Pay 2x the minFee to be safe — relayer may quote slightly higher at broadcast.
  const feeAmount = parseUnits((Number(feeData.minFee) * 2).toFixed(6), feeData.token.decimals);
  const delegation = createDelegation({
    environment: smartAccount.environment,
    from: smartAccount.address,
    to: feeData.targetAddress,
    scope: {
      type: "erc20TransferAmount",
      tokenAddress: USDC_BASE,
      maxAmount: feeAmount,
    },
  });
  console.log(`  delegation scope: transfer up to ${Number(feeAmount) / 1e6} USDC to relayer target`);

  // 7. Sign the delegation via the smart account.
  //    The signed delegation goes into permissionContext as a plain object
  //    (NOT hex-encoded). Schema lifted from 1Shot's public-relayer skill.
  const signature = await smartAccount.signDelegation({ delegation });
  const signedDelegation = { ...delegation, signature };
  ok(`delegation signed — caveats=${signedDelegation.caveats.length}`);

  // 8. Build the execution: USDC.transfer(feeCollector, feeAmount).
  const transferData = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [feeData.feeCollector, feeAmount],
  });
  const execution = {
    target: USDC_BASE,
    value: "0",
    data: transferData,
  };

  // 9. Submit to 1Shot per canonical schema:
  //    { chainId, transactions: [{ permissionContext: [signedDelegation], executions: [...] }],
  //      authorizationList: [auth], context: feeData.context }
  const submitParams = {
    chainId: String(base.id),
    context: feeData.context,
    authorizationList: [auth],
    transactions: [
      {
        permissionContext: [signedDelegation],
        executions: [execution],
      },
    ],
  };
  console.log("\n  submitting to 1Shot…");
  // The relayer returns either a tx hash string (sync confirm) or an object
  // with `{ id }` for async polling. Handle both.
  type SubmitResult = `0x${string}` | { id?: string; txHash?: `0x${string}` };
  const submitResult = await rpc<SubmitResult>("relayer_send7710Transaction", submitParams);
  const txHash =
    typeof submitResult === "string"
      ? submitResult
      : (submitResult.txHash ?? submitResult.id ?? "<no hash>");
  ok(`submitted — tx ${txHash}`);
  console.log(`  basescan: https://basescan.org/tx/${txHash}`);

  // 10. Poll for code installation. The tx may already be confirmed if the
  //     relayer returned the hash directly; give it a couple seconds just in
  //     case the node we read from hasn't seen the receipt yet.
  for (let i = 0; i < 15; i++) {
    const code = await publicClient.getCode({ address: account.address });
    if (code && code !== "0x") {
      ok(`EOA now has code (${code.length / 2 - 1} bytes) — 7702 upgrade landed`);
      console.log(`  account view: https://basescan.org/address/${account.address}`);
      console.log(`  code: ${code.slice(0, 50)}…`);
      return;
    }
    await sleep(2000);
  }
  fail("EOA still has no code after 30s of polling");
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
