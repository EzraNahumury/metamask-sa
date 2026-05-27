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
  AGENT_PORT: z.coerce.number().int().positive().default(4030),
  AGENT_CORS_ORIGIN: z.string().default("*"),
});

export const config = Schema.parse(process.env);
