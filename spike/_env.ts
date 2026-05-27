import "dotenv/config";
import { z } from "zod";

const Env = z.object({
  VENICE_API_KEY: z.string().min(1).optional(),
  VENICE_BASE_URL: z.string().url().default("https://api.venice.ai/api/v1"),
  VENICE_TEXT_MODEL: z.string().default("venice-uncensored"),
  VENICE_IMAGE_MODEL: z.string().default("venice-sd35"),
  VENICE_AUDIO_VOICE: z.string().default("af_sky"),

  ONESHOT_RELAYER_URL: z.string().url().default("https://relayer.1shotapi.com/relayers"),
  ONESHOT_CHAIN_ID: z.coerce.number().int().positive().default(42220),
  ONESHOT_FEE_TOKEN: z.string().min(1).default("0xceba9300f2b948710d2653dd7b07f33a8b32118c"),

  CHAIN_RPC_URL: z.string().url().default("https://forno.celo.org"),

  SPIKE_PRIVATE_KEY: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, "SPIKE_PRIVATE_KEY must be 0x + 64 hex chars")
    .optional(),

  WEBHOOK_PUBLIC_URL: z.string().url().optional(),
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
