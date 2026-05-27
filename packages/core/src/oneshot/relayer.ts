import type {
  ChainCapabilities,
  FeeQuote,
  Send7710Params,
} from "./types.js";

const DEFAULT_RELAYER = "https://relayer.1shotapi.com/relayers";

function bigintReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}

export class OneShotRelayerClient {
  constructor(private readonly endpoint: string = DEFAULT_RELAYER) {}

  private async rpc<T>(method: string, params: unknown): Promise<T> {
    const body = JSON.stringify(
      { jsonrpc: "2.0", id: Date.now(), method, params },
      bigintReplacer,
    );
    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    if (!res.ok) {
      throw new Error(`1Shot HTTP ${res.status} — ${await res.text()}`);
    }
    const json = (await res.json()) as {
      result?: T;
      error?: { code: number; message: string };
    };
    if (json.error) {
      throw new Error(`1Shot ${method} → ${json.error.code}: ${json.error.message}`);
    }
    if (json.result === undefined) {
      throw new Error(`1Shot ${method} returned no result`);
    }
    return json.result;
  }

  /**
   * `relayer_getCapabilities` — chain support + fee tokens + collectors.
   */
  async getCapabilities(chainId: number | string): Promise<Record<string, ChainCapabilities>> {
    return this.rpc("relayer_getCapabilities", [String(chainId)]);
  }

  /**
   * `relayer_getFeeData` — fresh quote, short-lived. Re-quote per submission.
   */
  async getFeeData(chainId: number | string, token: string): Promise<FeeQuote> {
    return this.rpc("relayer_getFeeData", { chainId: String(chainId), token });
  }

  /**
   * `relayer_send7710Transaction` — single entry point for all DeleGate.AI
   * onchain actions. Returns the broadcast tx hash inline or a job id +
   * txHash for async confirms.
   *
   * Canonical schema reverse-engineered in spike 07; the corrections that
   * unblock submission live in SPIKE.md.
   */
  async send7710Transaction(
    params: Send7710Params,
  ): Promise<`0x${string}` | { id?: string; txHash?: `0x${string}` }> {
    return this.rpc("relayer_send7710Transaction", params);
  }

  /** Status polling helper for async submissions. */
  async getStatus(id: string): Promise<{ status: string; txHash?: `0x${string}` }> {
    return this.rpc("relayer_getStatus", { id });
  }
}
