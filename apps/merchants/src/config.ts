import "dotenv/config";
import { z } from "zod";

const Schema = z.object({
  PORT: z.coerce.number().int().positive().default(4021),
  MERCHANT_RECIPIENT: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .default("0x000000000000000000000000000000000000dEaD"),
  BASE_RPC_URL: z.string().url().default("https://mainnet.base.org"),
});

export const config = Schema.parse(process.env);
