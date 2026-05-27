/**
 * Spike 03 — ERC-7702 upgrade of a burner EOA to a MetaMask Smart Account,
 * with the upgrade transaction relayed by 1Shot's permissionless relayer.
 *
 * What this script does:
 *   1. Loads the burner EOA from SPIKE_PRIVATE_KEY.
 *   2. Creates a MetaMask Stateless7702 smart account object on top of it.
 *   3. Builds the ERC-7702 authorizationList entry for the upgrade.
 *   4. Submits a no-op upgrade transaction via 1Shot's
 *      `relayer_send7710Transaction`, attaching the auth list so the
 *      relayer performs the in-flight 7702 upgrade.
 *   5. Polls `relayer_getStatus` until confirmed.
 *
 * SAFETY:
 *   - SPIKE_PRIVATE_KEY MUST be a burner wallet. Never use a real key here.
 *   - The script intentionally executes a no-op "self call with 0 value" as
 *     the user operation so the upgrade is the only state change.
 *
 * If this script completes, the foundation works. If it doesn't, we have
 * a workaround question to ask the sponsors before Day 1.
 *
 * Run:  pnpm spike:7702
 */
import { createPublicClient, defineChain, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { banner, env, fail, ok, requireEnv } from "./_env.js";

// We define Celo manually (without viem's legacy Celo block formatters) so
// the kit's generic Chain accepts our publicClient. Celo is fully EVM-
// equivalent post-L2 migration; the legacy formatters are unnecessary here.
const celo = defineChain({
  id: 42220,
  name: "Celo",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: { default: { http: ["https://forno.celo.org"] } },
  blockExplorers: { default: { name: "Celoscan", url: "https://celoscan.io" } },
});

type RpcRes<T> = { jsonrpc: "2.0"; id: number; result?: T; error?: { code: number; message: string } };

async function rpc<T>(method: string, params: unknown): Promise<T> {
  const res = await fetch(env.ONESHOT_RELAYER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${await res.text()}`);
  const json = (await res.json()) as RpcRes<T>;
  if (json.error) throw new Error(`${method} → ${json.error.code}: ${json.error.message}`);
  if (json.result === undefined) throw new Error(`${method} returned no result`);
  return json.result;
}

async function main() {
  banner("Spike 03 — ERC-7702 upgrade via 1Shot");

  const pk = requireEnv("SPIKE_PRIVATE_KEY") as `0x${string}`;
  const account = privateKeyToAccount(pk);
  console.log(`  EOA address:    ${account.address}`);

  const publicClient = createPublicClient({
    chain: celo,
    transport: http(env.CHAIN_RPC_URL),
  });

  // 1. Dynamic-import the kit so the script can still load if deps aren't installed yet.
  const { Implementation, toMetaMaskSmartAccount } = await import(
    "@metamask/smart-accounts-kit"
  ).catch((e) => {
    throw new Error(
      `Could not import @metamask/smart-accounts-kit. Did you run \`pnpm install\` in the repo root? Underlying: ${
        e instanceof Error ? e.message : String(e)
      }`,
    );
  });

  const smartAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Stateless7702,
    address: account.address,
    signer: { account },
  });
  ok(`Smart account object created (impl=Stateless7702, address=${smartAccount.address})`);

  // 2. Sign the 7702 authorization.
  //    The contractAddress is the Stateless7702 delegator implementation.
  //    The viem walletClient/account exposes signAuthorization for this.
  //    NOTE: the actual delegator implementation address comes from the kit
  //          and may vary per chain — when running this spike, log
  //          `smartAccount.implementationAddress` if available and use it.
  const implementationAddress =
    (smartAccount as unknown as { implementationAddress?: `0x${string}` }).implementationAddress ??
    // Fallback: read from a well-known kit export (will throw at runtime if undefined,
    // surfacing the question early).
    (await import("@metamask/smart-accounts-kit").then(
      (m) => (m as unknown as { Stateless7702DelegatorAddress?: `0x${string}` }).Stateless7702DelegatorAddress,
    ));

  if (!implementationAddress) {
    throw new Error(
      "Could not resolve the Stateless7702 delegator address from the kit. Check the kit docs/changelog and pin a known address for this chain in SPIKE.md.",
    );
  }
  console.log(`  delegator impl: ${implementationAddress}`);

  // 3. Build the authorization list entry. With viem ≥ 2.21 we use signAuthorization.
  const nonce = await publicClient.getTransactionCount({ address: account.address });
  const auth = await account.signAuthorization({
    chainId: celo.id,
    contractAddress: implementationAddress,
    nonce,
  });
  ok(`Signed 7702 authorization (nonce=${nonce})`);

  // 4. Submit via 1Shot. The exact param shape for `relayer_send7710Transaction`
  //    when bundling a 7702 auth + 7710 execution is documented at
  //    https://1shotapi.com/docs/quickstarts/gas-sponsorship-eip7710 — when this
  //    script first runs we capture the request/response in SPIKE.md.
  //
  //    For this no-op upgrade we send a self-call with empty calldata.
  const txParams = {
    chainId: String(celo.id),
    feeToken: env.ONESHOT_FEE_TOKEN,
    authorizationList: [auth],
    delegation: null,                     // first-use: no 7710 delegation yet, just the upgrade
    execution: {
      target: account.address,            // self-call
      value: "0x0",
      data: "0x",
    },
  };

  console.log("  submitting upgrade tx to 1Shot…");
  const submitResult = await rpc<{ id?: string; txHash?: `0x${string}` }>(
    "relayer_send7710Transaction",
    txParams,
  );
  ok(`Submitted: ${JSON.stringify(submitResult)}`);

  // 5. Poll status.
  if (submitResult.id) {
    for (let i = 0; i < 30; i++) {
      await sleep(2000);
      const status = await rpc<{ status: string; txHash?: `0x${string}` }>(
        "relayer_getStatus",
        { id: submitResult.id },
      );
      console.log(`  poll ${i + 1}: ${status.status}${status.txHash ? " — " + status.txHash : ""}`);
      if (status.status === "CONFIRMED" || status.status === "FAILED") break;
    }
  }

  // 6. Verify code at EOA is now non-empty (7702 sets the delegator code).
  const code = await publicClient.getCode({ address: account.address });
  if (code && code !== "0x") {
    ok(`EOA now has code (length=${code.length / 2 - 1} bytes) — 7702 upgrade visible onchain`);
  } else {
    fail("EOA still has empty code — upgrade did not land. Check the relayer status above.");
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
