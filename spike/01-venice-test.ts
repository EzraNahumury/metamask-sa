/**
 * Spike 01 — Venice AI smoke test.
 *
 * Verifies we can hit three Venice endpoints we plan to use in DeleGate.AI:
 *   1. chat/completions  (text reasoning + Friday Brief copy)
 *   2. image/generations (Friday Brief spending chart)
 *   3. audio/speech      (Friday Brief TTS narration)
 *
 * If any of these fail, the Venice bonus track is at risk and we need to
 * decide on a fallback (e.g. swap to text-only digest) before Day 1.
 *
 * Run:  pnpm spike:venice
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { banner, env, fail, ok, requireEnv } from "./_env.js";

async function veniceFetch(endpoint: string, body: unknown, asBinary = false) {
  const apiKey = requireEnv("VENICE_API_KEY");
  const url = `${env.VENICE_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText} — ${text.slice(0, 400)}`);
  }
  return asBinary ? new Uint8Array(await res.arrayBuffer()) : await res.json();
}

async function testChat() {
  const out = (await veniceFetch("/chat/completions", {
    model: env.VENICE_TEXT_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are DeleGate.AI. Respond ONLY with strict JSON matching {action: 'PAY'|'REFUSE'|'ESCALATE', amount: number, reason: string, confidence: number}.",
      },
      {
        role: "user",
        content:
          "Invoice for Netflix-mock $15.99. Rolling median last 6 invoices: $15.99. Weekly remaining budget: $42.10. Decide.",
      },
    ],
    temperature: 0.2,
  })) as { choices: Array<{ message: { content: string } }> };

  const content = out.choices?.[0]?.message?.content ?? "";
  ok(`chat/completions returned ${content.length} chars`);
  console.log("    ↳ sample:", content.slice(0, 200).replace(/\s+/g, " "));
}

async function testImage() {
  const out = (await veniceFetch("/image/generations", {
    model: env.VENICE_IMAGE_MODEL,
    prompt: "editorial minimalist line chart, weekly spending overview, soft pastel palette",
    width: 1024,
    height: 576,
    n: 1,
  })) as { data?: Array<{ url?: string; b64_json?: string }> };

  const first = out.data?.[0];
  if (!first) throw new Error("No image returned");
  if (first.b64_json) {
    const buf = Buffer.from(first.b64_json, "base64");
    const outPath = path.resolve("output", "spike-venice-image.png");
    await writeFile(outPath, buf);
    ok(`image saved to ${outPath} (${buf.length} bytes)`);
  } else if (first.url) {
    ok(`image url: ${first.url}`);
  } else {
    throw new Error("Image returned but contained neither b64_json nor url");
  }
}

async function testAudio() {
  const audio = (await veniceFetch(
    "/audio/speech",
    {
      model: "tts-kokoro",
      input:
        "This week DeleGate paid 34 dollars and 97 cents across four services and refused one anomaly.",
      voice: env.VENICE_AUDIO_VOICE,
      response_format: "mp3",
    },
    true,
  )) as Uint8Array;

  const outPath = path.resolve("output", "spike-venice-audio.mp3");
  await writeFile(outPath, audio);
  ok(`audio saved to ${outPath} (${audio.byteLength} bytes)`);
}

async function main() {
  banner("Spike 01 — Venice AI smoke test");
  await ensureOutputDir();

  try {
    await testChat();
  } catch (e) {
    fail("chat/completions failed", e);
  }
  try {
    await testImage();
  } catch (e) {
    fail("image/generations failed", e);
  }
  try {
    await testAudio();
  } catch (e) {
    fail("audio/speech failed", e);
  }
}

async function ensureOutputDir() {
  const { mkdir } = await import("node:fs/promises");
  await mkdir("output", { recursive: true });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
