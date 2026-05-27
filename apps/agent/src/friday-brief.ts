import { VeniceClient } from "@delegate/core";
import { privateKeyToAccount } from "viem/accounts";
import { config } from "./config.js";
import { db, type Decision } from "./db.js";

const SYSTEM_PROMPT = `You are DeleGate.AI, an AI chief of staff for onchain money.
Compile a friendly, punchy weekly digest for the user.

Output STRICT JSON only, matching:
{
  "headline": "<one-liner, 60 chars max>",
  "summary": "<2-3 short paragraphs, plain text, no markdown>",
  "spendPaidUsd": <number>,
  "spendRefusedUsd": <number>,
  "cancellationSuggestions": [
    { "service": "<slug>", "reason": "<why cancel>" }
  ],
  "voiceScript": "<60 seconds when read aloud — natural spoken English>"
}`;

type BriefSummary = {
  headline: string;
  summary: string;
  spendPaidUsd: number;
  spendRefusedUsd: number;
  cancellationSuggestions: Array<{ service: string; reason: string }>;
  voiceScript: string;
};

export type FridayBrief = BriefSummary & {
  generatedAt: string;
  weekStart: string;
  weekEnd: string;
  chartImageBase64: string | null;
  audioBase64: string | null;
  audioMimeType: string;
  decisions: Decision[];
  stats: {
    decisionCount: number;
    payCount: number;
    refuseCount: number;
    escalateCount: number;
    txHashCount: number;
    receiptCount: number;
  };
};

function microUsdcToUsd(micro: string | bigint): number {
  const n = typeof micro === "bigint" ? Number(micro) : Number(BigInt(micro));
  return n / 1e6;
}

function buildStats(decisions: Decision[]) {
  return {
    decisionCount: decisions.length,
    payCount: decisions.filter((d) => d.action === "PAY").length,
    refuseCount: decisions.filter((d) => d.action === "REFUSE").length,
    escalateCount: decisions.filter((d) => d.action === "ESCALATE").length,
    txHashCount: decisions.filter((d) => d.txHash).length,
    receiptCount: decisions.filter((d) => d.receiptId).length,
  };
}

function buildPayload(decisions: Decision[]) {
  const aggregated = new Map<
    string,
    { pays: number; refuses: number; totalUsd: number; samples: string[] }
  >();
  for (const d of decisions) {
    const row = aggregated.get(d.service) ?? { pays: 0, refuses: 0, totalUsd: 0, samples: [] };
    if (d.action === "PAY") {
      row.pays += 1;
      row.totalUsd += microUsdcToUsd(d.quotedMicroUsdc);
    } else if (d.action === "REFUSE") {
      row.refuses += 1;
    }
    if (row.samples.length < 3) row.samples.push(`${d.action}: ${d.reason}`);
    aggregated.set(d.service, row);
  }
  const services = Array.from(aggregated.entries()).map(([service, row]) => ({
    service,
    paid: row.pays,
    refused: row.refuses,
    paidUsd: row.totalUsd.toFixed(2),
    sampleReasoning: row.samples,
  }));
  return {
    weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    weekEnd: new Date().toISOString(),
    services,
  };
}

export async function generateFridayBrief(): Promise<FridayBrief> {
  if (!config.SPIKE_PRIVATE_KEY) {
    throw new Error("SPIKE_PRIVATE_KEY missing in .env (used for Venice x402 auth).");
  }
  const account = privateKeyToAccount(config.SPIKE_PRIVATE_KEY as `0x${string}`);
  const venice = new VeniceClient({ account });

  const decisions = db.list();
  const stats = buildStats(decisions);
  const aggregate = buildPayload(decisions);

  // 1. Text reasoning — strict JSON output.
  const chatRes = await venice.chat({
    model: config.VENICE_TEXT_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Compose a weekly DeleGate.AI brief.

This week's data:
${JSON.stringify(aggregate, null, 2)}

Stats:
${JSON.stringify(stats, null, 2)}

The user wants concrete cancellation suggestions where the data justifies it. The voiceScript should sound natural when narrated aloud.`,
      },
    ],
    temperature: 0.4,
    response_format: { type: "json_object" },
  });

  let parsed: BriefSummary;
  try {
    parsed = JSON.parse(chatRes.choices?.[0]?.message?.content ?? "{}");
  } catch {
    parsed = {
      headline: "Weekly digest",
      summary: "Could not parse model output as JSON.",
      spendPaidUsd: 0,
      spendRefusedUsd: 0,
      cancellationSuggestions: [],
      voiceScript: "Weekly DeleGate brief unavailable this week.",
    };
  }

  // 2. Generated chart image (stylised — chart accuracy is secondary, vibe is primary).
  let chartImageBase64: string | null = null;
  try {
    const top = aggregate.services
      .map((s) => `${s.service} ${s.paidUsd}`)
      .slice(0, 5)
      .join(", ");
    const imgRes = await venice.image({
      model: config.VENICE_IMAGE_MODEL,
      prompt: `editorial minimalist line chart, weekly spending overview, soft pastel palette, monochrome with one accent colour, finance dashboard vibe, axes labeled abstractly. Annotate stats: ${top}.`,
      width: 1024,
      height: 576,
    });
    chartImageBase64 = imgRes.imagesBase64[0] ?? null;
  } catch {
    // image is optional — keep the brief usable without it
  }

  // 3. TTS narration of voiceScript.
  let audioBase64: string | null = null;
  try {
    const ttsRes = await venice.tts({
      model: "tts-kokoro",
      input: parsed.voiceScript ?? "Weekly DeleGate brief.",
      voice: config.VENICE_AUDIO_VOICE,
    });
    audioBase64 = Buffer.from(ttsRes.audio).toString("base64");
  } catch {
    // audio is optional
  }

  return {
    ...parsed,
    generatedAt: new Date().toISOString(),
    weekStart: aggregate.weekStart,
    weekEnd: aggregate.weekEnd,
    chartImageBase64,
    audioBase64,
    audioMimeType: "audio/mpeg",
    decisions,
    stats,
  };
}
