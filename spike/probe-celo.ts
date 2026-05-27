import { env } from "./_env.js";

const CANDIDATES: Array<{ id: number; name: string }> = [
  { id: 42220, name: "Celo mainnet" },
  { id: 44787, name: "Celo Alfajores (testnet)" },
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
      console.log(`  ✗ ${chainId}  ${name} — ${j.error.message}`);
      return;
    }
    const result = JSON.stringify(j.result, null, 2);
    const supported = result && result !== "{}" && result !== "null";
    console.log(`  ${supported ? "✓ SUPPORTED" : "○ not supported"}  ${chainId}  ${name}`);
    if (supported) console.log(result);
  } catch (e) {
    console.log(`  ! ${chainId} ${name} — ${(e as Error).message}`);
  }
}

for (const c of CANDIDATES) await probe(c.id, c.name);
