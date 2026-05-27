import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

// Load .env from repo root, regardless of which directory we run from.
const here = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(here, "..", ".env") });

// Treat empty strings in .env as "not set" so optional fields work cleanly.
const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

const Env = z.object({
  VENICE_API_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  VENICE_BASE_URL: z.string().url().default("https://api.venice.ai/api/v1"),
  VENICE_TEXT_MODEL: z.string().default("venice-uncensored"),
  VENICE_IMAGE_MODEL: z.string().default("venice-sd35"),
  VENICE_AUDIO_VOICE: z.string().default("af_sky"),

  ONESHOT_RELAYER_URL: z.string().url().default("https://relayer.1shotapi.com/relayers"),
  ONESHOT_CHAIN_ID: z.coerce.number().int().positive().default(8453),
  ONESHOT_FEE_TOKEN: z.string().min(1).default("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"),

  CHAIN_RPC_URL: z.string().url().default("https://mainnet.base.org"),

  SPIKE_PRIVATE_KEY: z.preprocess(
    (v) => {
      if (typeof v !== "string") return undefined;
      const trimmed = v.trim();
      if (trimmed === "") return undefined;
      // Accept with or without 0x; always normalize to 0x-prefixed.
      const hex = trimmed.startsWith("0x") || trimmed.startsWith("0X")
        ? trimmed.slice(2)
        : trimmed;
      return `0x${hex.toLowerCase()}`;
    },
    z
      .string()
      .regex(/^0x[a-fA-F0-9]{64}$/, "SPIKE_PRIVATE_KEY must be 64 hex chars (0x prefix optional)")
      .optional(),
  ),

  WEBHOOK_PUBLIC_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  WEBHOOK_PORT: z.coerce.number().int().positive().default(8787),
});

export const env = Env.parse(process.env);

export function requireEnv<K extends keyof typeof env>(key: K): NonNullable<(typeof env)[K]> {
  const v = env[key];
  if (v === undefined || v === null || v === "") {
    throw new Error(`Missing required env var: ${String(key)}. Fill it in .env and retry.`);
  }
  return v as NonNullable<(typeof env)[K]>;
}

export function banner(title: string) {
  const bar = "═".repeat(Math.max(40, title.length + 8));
  console.log(`\n${bar}\n  ${title}\n${bar}`);
}

export function ok(msg: string) {
  console.log(`  ✓ ${msg}`);
}

export function fail(msg: string, err?: unknown) {
  console.error(`  ✗ ${msg}`);
  if (err) console.error("    ↳", err instanceof Error ? err.message : err);
}
