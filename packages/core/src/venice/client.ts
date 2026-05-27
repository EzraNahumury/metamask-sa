import type { Account } from "viem";
import { USDC_BASE } from "../chain/addresses.js";
import { buildVeniceSiweHeader } from "./siwe.js";
import { buildX402PaymentHeader, type X402V2Requirement } from "./payment.js";

const DEFAULT_BASE_URL = "https://api.venice.ai/api/v1";

export type VeniceConfig = {
  baseUrl?: string;
  /**
   * Optional Bearer key auth fallback. If both `apiKey` and a wallet are
   * provided, the wallet path wins for top-up calls but inference will
   * default to Bearer if `account` is undefined.
   */
  apiKey?: string;
  /** Signing account used for SIWE and EIP-3009 (x402 path). */
  account?: Pick<Account, "address" | "signMessage" | "signTypedData">;
};

type X402AcceptsBody = { x402Version: number; accepts: X402V2Requirement[] };

export class VeniceClient {
  private readonly baseUrl: string;
  constructor(private readonly cfg: VeniceConfig) {
    this.baseUrl = cfg.baseUrl ?? DEFAULT_BASE_URL;
  }

  private async authHeaders(resourceUri: string): Promise<Record<string, string>> {
    if (this.cfg.account) {
      return { "X-Sign-In-With-X": await buildVeniceSiweHeader(this.cfg.account, resourceUri) };
    }
    if (this.cfg.apiKey) {
      return { Authorization: `Bearer ${this.cfg.apiKey}` };
    }
    throw new Error("VeniceClient: provide either an `account` (x402) or an `apiKey` (Bearer).");
  }

  private url(path: string) {
    return `${this.baseUrl}${path}`;
  }

  /**
   * Fetch x402 payment requirements. POSTs `/x402/top-up` with auth but no
   * payment header — Venice responds with the accepted networks/amounts.
   */
  async getX402Requirements(): Promise<X402AcceptsBody> {
    const uri = this.url("/x402/top-up");
    const headers = await this.authHeaders(uri);
    const r = await fetch(uri, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
    });
    const body = await r.text();
    try {
      return JSON.parse(body) as X402AcceptsBody;
    } catch {
      throw new Error(`Unexpected /x402/top-up response (${r.status}): ${body.slice(0, 400)}`);
    }
  }

  /**
   * Build, sign and submit an x402 top-up. Returns the parsed Venice
   * response body so callers can read `newBalance` / `paymentId`.
   */
  async topUpViaX402(opts?: {
    /** Override the requirement to use; defaults to the eip155:8453 one. */
    requirement?: X402V2Requirement;
    /** USDC contract on the chosen chain. Defaults to Base USDC. */
    usdcContract?: `0x${string}`;
    /** Override the validity window in seconds. */
    validitySeconds?: number;
  }) {
    if (!this.cfg.account) throw new Error("topUpViaX402 requires VeniceClient({ account }).");
    const requirements = await this.getX402Requirements();
    const requirement =
      opts?.requirement ??
      requirements.accepts.find((a) => a.network === "eip155:8453") ??
      requirements.accepts[0];
    if (!requirement) throw new Error("No payment requirements advertised by Venice.");

    const x402Header = await buildX402PaymentHeader({
      account: this.cfg.account,
      requirement,
      x402Version: requirements.x402Version,
      usdcContract: opts?.usdcContract ?? USDC_BASE,
      validitySeconds: opts?.validitySeconds,
    });

    const uri = this.url("/x402/top-up");
    const auth = await this.authHeaders(uri);
    const r = await fetch(uri, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...auth,
        "X-402-Payment": x402Header,
      },
    });
    const body = await r.text();
    if (!r.ok) {
      throw new Error(`Venice top-up failed (${r.status}): ${body.slice(0, 400)}`);
    }
    return JSON.parse(body) as {
      success: boolean;
      data?: { walletAddress: string; amountCredited: number; newBalance: number; paymentId: string };
    };
  }

  /** Plain chat completion. Auth picked automatically per `VeniceConfig`. */
  async chat(payload: {
    model: string;
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
    temperature?: number;
    response_format?: unknown;
  }): Promise<{
    choices: Array<{ message: { content: string } }>;
    balanceRemaining?: string | null;
  }> {
    const uri = this.url("/chat/completions");
    const headers = await this.authHeaders(uri);
    const r = await fetch(uri, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error(`Venice chat failed (${r.status}): ${(await r.text()).slice(0, 400)}`);
    const balanceRemaining = r.headers.get("x-balance-remaining");
    const json = (await r.json()) as { choices: Array<{ message: { content: string } }> };
    return { ...json, balanceRemaining };
  }

  /** Image generation. Returns base64 PNG. */
  async image(payload: {
    model: string;
    prompt: string;
    width?: number;
    height?: number;
  }): Promise<{ imagesBase64: string[]; balanceRemaining?: string | null }> {
    const uri = this.url("/image/generate");
    const headers = await this.authHeaders(uri);
    const r = await fetch(uri, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error(`Venice image failed (${r.status}): ${(await r.text()).slice(0, 400)}`);
    const balanceRemaining = r.headers.get("x-balance-remaining");
    const json = (await r.json()) as { images?: string[] };
    return { imagesBase64: json.images ?? [], balanceRemaining };
  }

  /** Text-to-speech. Returns mp3 bytes. */
  async tts(payload: {
    model: string;
    input: string;
    voice: string;
  }): Promise<{ audio: Uint8Array; balanceRemaining?: string | null }> {
    const uri = this.url("/audio/speech");
    const headers = await this.authHeaders(uri);
    const r = await fetch(uri, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ ...payload, response_format: "mp3" }),
    });
    if (!r.ok) throw new Error(`Venice tts failed (${r.status}): ${(await r.text()).slice(0, 400)}`);
    const balanceRemaining = r.headers.get("x-balance-remaining");
    const audio = new Uint8Array(await r.arrayBuffer());
    return { audio, balanceRemaining };
  }
}
