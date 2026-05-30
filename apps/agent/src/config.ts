import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { z } from "zod";

const here = path.dirname(fileURLToPath(import.meta.url));
// Apps/agent → repo root .env.
loadEnv({ path: path.resolve(here, "..", "..", "..", ".env") });

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const Schema = z.object({
  SPIKE_PRIVATE_KEY: z.preprocess(
    (v) => {
      if (typeof v !== "string") return undefined;
      const trimmed = v.trim();
      if (trimmed === "") return undefined;
      const hex = trimmed.startsWith("0x") || trimmed.startsWith("0X")
        ? trimmed.slice(2)
        : trimmed;
      return `0x${hex.toLowerCase()}`;
    },
    z
      .string()
      .regex(/^0x[a-fA-F0-9]{64}$/, "SPIKE_PRIVATE_KEY must be 64 hex chars")
      .optional(),
  ),

  VENICE_TEXT_MODEL: z.string().default("venice-uncensored"),
  VENICE_IMAGE_MODEL: z.string().default("venice-sd35"),
  VENICE_AUDIO_VOICE: z.string().default("af_sky"),

  MERCHANTS_BASE_URL: z.preprocess(emptyToUndefined, z.string().url().default("http://localhost:4021")),

  AGENT_TICK_SECONDS: z.coerce.number().int().positive().default(30),
  // PORT is set by Railway / Render / Fly; AGENT_PORT remains for local dev.
  PORT: z.coerce.number().int().positive().optional(),
  AGENT_PORT: z.coerce.number().int().positive().default(4030),
  AGENT_CORS_ORIGIN: z.string().default("*"),
  /**
   * "off"  — receipts are mock only (no onchain spend).
   * "dust" — each PAY also fires a small onchain USDC transfer via 1Shot
   *          (default 10000 micro = $0.01 USDC) so we get a real tx hash.
   */
  ONCHAIN_SETTLEMENT_MODE: z.enum(["off", "dust"]).default("off"),
  /** Dust transfer amount in micro-USDC. Default 10000 = $0.01 USDC. */
  ONCHAIN_DUST_MICRO_USDC: z.coerce.bigint().default(BigInt(10000)),
  /** Recipient for onchain dust transfers. Defaults to the burn address. */
  SETTLEMENT_RECIPIENT: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .default("0x000000000000000000000000000000000000dEaD"),
  CHAIN_RPC_URL: z.string().url().default("https://mainnet.base.org"),
});

export const config = Schema.parse(process.env);
