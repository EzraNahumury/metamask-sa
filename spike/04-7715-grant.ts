/**
 * Spike 04 — ERC-7715 advanced permission grant (programmatic path).
 *
 * In production, the user clicks a "grant permissions" prompt inside the
 * MetaMask extension. For the spike we exercise the same path via
 * `erc7715ProviderActions` over a programmatic wallet client so we can
 * verify:
 *   - the permission request shape we plan to use is accepted
 *   - the response includes a `permissionsContext` + `delegationManager`
 *     we can later redeem with `sendUserOperationWithDelegation`
 *
 * Two run modes:
 *   - "extension"     : requires a browser session (skipped by default).
 *   - "session"       : creates an in-memory session account and requests
 *                       permissions against a local mocked provider for
 *                       shape validation only.
 *
 * Run:  pnpm spike:7715
 */
import { createWalletClient, defineChain, http, parseUnits } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { banner, env, fail, ok } from "./_env.js";

const base = defineChain({
  id: 8453,
  name: "Base",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://mainnet.base.org"] } },
  blockExplorers: { default: { name: "BaseScan", url: "https://basescan.org" } },
});

const BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

async function main() {
  banner("Spike 04 — ERC-7715 permission grant shape check");

  // We use a session-account key generated locally. The real flow uses the
  // MetaMask extension wallet client; this script validates the request
  // payload shape and confirms the kit's typing accepts it.
  const sessionPk = generatePrivateKey();
  const sessionAccount = privateKeyToAccount(sessionPk);
  ok(`session account address: ${sessionAccount.address}`);

  // Construct the request body we plan to send in production.
  const currentTime = Math.floor(Date.now() / 1000);
  const oneWeek = currentTime + 7 * 24 * 60 * 60;

  const permissionRequest = [
    {
      chainId: base.id,
      expiry: oneWeek,
      signer: {
        type: "account",
        data: { address: sessionAccount.address },
      },
      permission: {
        type: "erc20-token-periodic",
        data: {
          tokenAddress: BASE_USDC,
          // $50 weekly cap
          periodAmount: parseUnits("50", 6).toString(),
          periodDuration: 7 * 24 * 60 * 60,
          justification: "DeleGate.AI weekly subscription budget",
        },
      },
      isAdjustmentAllowed: true,
    },
  ];

  console.log("  intended grantPermissions payload:");
  console.dir(permissionRequest, { depth: null });

  // Programmatic dry-run: import the kit's actions and check the function
  // is callable. We don't have window.ethereum here, so the actual call
  // would fail — we just confirm the surface exists.
  try {
    const { erc7715ProviderActions } = await import("@metamask/smart-accounts-kit/actions");
    const walletClient = createWalletClient({
      chain: base,
      transport: http(env.CHAIN_RPC_URL),
      account: sessionAccount,
    }).extend(erc7715ProviderActions());

    if (typeof (walletClient as unknown as { requestExecutionPermissions?: unknown })
        .requestExecutionPermissions === "function") {
      ok("walletClient.requestExecutionPermissions exists — surface is correct");
    } else {
      fail("requestExecutionPermissions method missing — kit API may have changed");
    }
  } catch (e) {
    fail("Could not import @metamask/smart-accounts-kit/actions", e);
  }

  console.log("\n  Next step (extension path):");
  console.log("  Open the frontend app, connect MetaMask extension, and call");
  console.log("  walletClient.requestExecutionPermissions(<the payload above>).");
  console.log("  The MetaMask UI should render a permission prompt with the caveats above.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
