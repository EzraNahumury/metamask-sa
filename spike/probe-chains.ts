/**
 * One-off helper: probe which chains the 1Shot public relayer actually
 * supports right now. Spike 02 told us Sepolia (11155111) is not
 * supported, so let's enumerate the common candidates.
 *
 * Run:  npx tsx probe-chains.ts
 */
import { env } from "./_env.js";

const CANDIDATES: Array<{ id: number; name: string }> = [
  { id: 1, name: "Ethereum mainnet" },
  { id: 10, name: "Optimism" },
  { id: 56, name: "BNB Chain" },
  { id: 137, name: "Polygon" },
  { id: 8453, name: "Base" },
  { id: 42161, name: "Arbitrum One" },
  { id: 43114, name: "Avalanche C-chain" },
  { id: 11155111, name: "Sepolia" },
  { id: 84532, name: "Base Sepolia" },
  { id: 421614, name: "Arbitrum Sepolia" },
  { id: 11155420, name: "Optimism Sepolia" },
  { id: 80002, name: "Polygon Amoy" },
];

async function probe(chainId: number, name: string) {
  try {
    const r = await fetch(env.ONESHOT_RELAYER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: chainId,
        method: "relayer_getCapabilities",
        params: [String(chainId)],
      }),
    });
    const j = (await r.json()) as { result?: unknown; error?: { code: number; message: string } };
    if (j.error) {
      console.log(`  ✗ ${chainId.toString().padStart(10)}  ${name.padEnd(20)} — ${j.error.message}`);
    } else {
      const result = JSON.stringify(j.result);
      const supported = result && result !== "{}" && result !== "null";
      console.log(
        `  ${supported ? "✓" : "○"} ${chainId.toString().padStart(10)}  ${name.padEnd(20)} — ${result.slice(0, 200)}`,
      );
    }
  } catch (e) {
    console.log(`  ! ${chainId.toString().padStart(10)}  ${name.padEnd(20)} — ${(e as Error).message}`);
  }
}

async function main() {
  console.log("Probing 1Shot relayer capabilities for common chains…\n");
  for (const c of CANDIDATES) {
    await probe(c.id, c.name);
  }
}

main();
