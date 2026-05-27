/**
 * Probe which Venice image endpoint path actually exists.
 */
import { env, requireEnv } from "./_env.js";

const PATHS = [
  "/image/generate",
  "/image/generations",
  "/images/generations",
  "/images/generate",
  "/image/styles",
  "/image/upscale",
];

const key = requireEnv("VENICE_API_KEY");

for (const p of PATHS) {
  const r = await fetch(`${env.VENICE_BASE_URL}${p}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: env.VENICE_IMAGE_MODEL, prompt: "test", width: 512, height: 512 }),
  });
  const body = (await r.text()).slice(0, 180);
  console.log(`${r.status.toString().padStart(3)} ${p.padEnd(24)} — ${body.replace(/\s+/g, " ")}`);
}
