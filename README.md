<div align="center">

# DeleGate.AI

### Your AI chief of staff for onchain money — bounded, revocable, multimodal.

*An autonomous reasoning agent that pays your subscriptions over x402, refuses anomalies in real time, settles through a real ERC-7710 redemption on Base, and produces a Friday Brief in three Venice modalities.*

**Submission for [MetaMask Smart Accounts Kit × 1Shot API × Venice AI Dev Cook Off](./requirement.md).**

Tracks targeted: **Best Agent · Best x402 + ERC-7710 · Best use of Venice AI · Best Use of 1Shot Permissionless Relayer**.

</div>

---

## 1. What is this, in one paragraph

DeleGate.AI is an autonomous money-management agent. You give it a weekly USDC budget through an **ERC-7715** advanced permission on a **MetaMask Smart Account** (upgraded via **ERC-7702**). Every tick, the agent walks a list of subscription services, fetches an **HTTP 402** quote from each, asks **Venice** to reason about whether the price is sane, and either pays the merchant by signing an **EIP-3009** USDC transfer or refuses with an explanation. Approved payments are settled onchain through a real **ERC-7710 redelegation** broadcast by the **1Shot permissionless relayer** — gas paid in USDC, no ETH anywhere. Once per week the agent compiles a **Friday Brief** using three Venice endpoints — text reasoning, a generated chart image, and a 60-second voice narration. You can revoke at any time, onchain, in one tap.

---

## 2. Live demo flow

### 2.1 Run it on your machine in three terminals

```bash
# Terminal 1 — mock x402 merchants (netflix-mock, spotify-mock, …)
pnpm --filter @delegate/merchants run start

# Terminal 2 — reasoning agent + HTTP/SSE server
pnpm --filter @delegate/agent run start

# Terminal 3 — Next.js dashboard
pnpm --filter frontend run dev
```

Open <http://localhost:3000>.

### 2.2 What you see on the dashboard

The page reads top-down as a numbered document:

| Section | What it does |
|---|---|
| **Hero** | Big editorial headline + live burner USDC balance fetched from Base + Venice credit card + recent-activity ticker. |
| **01 Activate** | Connect any EIP-6963 wallet (our own picker, not the wallet's), pick a weekly cap ($2/$5/$10), sign an ERC-7715 grant. Local grant state shows the caveat summary. |
| **02 Subscriptions** | Five mock services as cards, each with the latest action and a 5-cell history strip. |
| **03 Demo controls** | "Run tick" button (also `T` on the keyboard) + per-service "Arm anomaly" buttons that inflate the next quote 32×. |
| **04 Friday Brief** | Single button generates the Venice text + image + audio digest in one round trip. |
| **05 Live decision feed** | Streams every PAY / REFUSE / ESCALATE in real time via SSE. Click any row to expand the Venice prompt and raw model output. Filter chips for All / Paid / Refused / Onchain. |

### 2.3 The 90-second demo arc

| Time | Action |
|---|---|
| 0:00 | Dashboard live, agent indicator emerald, marquee strip scrolls. |
| 0:08 | Press `G` → scrolls to Activate. Click **Connect wallet** → our EIP-6963 picker lists every wallet installed; pick MetaMask. Pick `$2/wk` cap. Click **Sign ERC-7715 grant** → MetaMask popup shows the caveats; approve. Caveat summary appears. |
| 0:35 | Press `T` → tick fires. Five Venice reasonings stream into the feed as toasts pop bottom-right. Each PAY row shows a basescan link once 1Shot relays. |
| 1:00 | Click **Arm netflix** → toast confirms 32× armed. Press `T` again. Netflix-mock row REFUSEs with the agent's spoken reason; others PAY. |
| 1:20 | Click a basescan link on a PAY row → see the real ERC-7710 redemption + two USDC transfers (fee + work) on chain. |
| 1:35 | Click **Generate Friday Brief** → ~10 s later, a headline, generated chart, and audio player render. Hit play; the voice narrates the week. |
| 2:00 | Click the burner address copy button → check-icon confirm. End on the proof tx link from the hero. |

Keyboard shortcuts hinted in section headers and the footer: `G` activate, `T` tick, `F` Friday Brief.

---

## 3. Onchain evidence (Base mainnet — verifiable now)

Real transactions broadcast by the public 1Shot relayer on behalf of the burner smart account `0x5Aea061d814A72de9EE9171bE86F45f48e1E2f5d`:

| What | Tx hash |
|---|---|
| **First ERC-7702 upgrade + ERC-7710 redemption** (spike 07) — installed the EIP7702 stateless delegator + paid 0.02 USDC fee | [`0xf199a88f1f7e2d28005365acd5ba63793d166c6b1d94cf77a2a807f53746052c`](https://basescan.org/tx/0xf199a88f1f7e2d28005365acd5ba63793d166c6b1d94cf77a2a807f53746052c) |
| Netflix-mock dust settlement (live tick) | [`0x4f219452a2f531d482828b76411d641056ac04df41c31713ee44422f71072714`](https://basescan.org/tx/0x4f219452a2f531d482828b76411d641056ac04df41c31713ee44422f71072714) |
| Spotify-mock dust settlement (live tick) | [`0xbf3ad3ebd8b077ec7310500f79b0e04481d8df9b69bd4a594389567aaa458156`](https://basescan.org/tx/0xbf3ad3ebd8b077ec7310500f79b0e04481d8df9b69bd4a594389567aaa458156) |
| Substack-mock dust settlement (live tick) | [`0xa7b180838fbb37976045e77daa421dfe224cafdbaa15384a1ed2e80816320fb0`](https://basescan.org/tx/0xa7b180838fbb37976045e77daa421dfe224cafdbaa15384a1ed2e80816320fb0) |
| Domain-mock dust settlement (live tick) | [`0x4bbc81bd6385be4317ce905a7ec7ed4b2b5f5eef41e821f3d6f60a4a59085839`](https://basescan.org/tx/0x4bbc81bd6385be4317ce905a7ec7ed4b2b5f5eef41e821f3d6f60a4a59085839) |
| ChatGPT-mock dust settlement (live tick) | [`0xdd5134d6126446d41fe723c6edf9c771be06c1a836d3fd1444782bfd4ecd833f`](https://basescan.org/tx/0xdd5134d6126446d41fe723c6edf9c771be06c1a836d3fd1444782bfd4ecd833f) |

Each settlement batches **two USDC transfers** inside one ERC-7710 redemption: the relayer fee to 1Shot's collector and the dust transfer to the merchant. The relayer broadcasted them; the smart account redeemed the delegation; the transfers landed. No paymaster, no ETH, no API keys.

The Venice x402 top-up of $5 USDC (paymentId `x402-fa4cdc720ee353dd072d31e7c4c5b167`) lives on Venice's books — verify by inspecting the burner balance change of -5 USDC to `0x2670b922ef37c7df47158725c0cc407b5382293f` between spike 07 and spike 08.

---

## 4. Stack — every sponsor primitive is load-bearing

| Sponsor primitive | Where it lives |
|---|---|
| **MetaMask Smart Accounts** | The user's EOA is upgraded to a Smart Account via ERC-7702 in-flight on the first 1Shot redemption. Every actor (user, agent) is an MM smart account. |
| **MetaMask ERC-7715 Advanced Permissions** | `frontend/app/components/OnboardingPanel.tsx` opens MetaMask's advanced-permissions prompt via `requestExecutionPermissions` from `@metamask/smart-accounts-kit/actions`. The grant is persisted to localStorage with all caveats (cap, period, expiry, session signer). The agent honors the same caveats inside `apps/agent/src/loop.ts`. |
| **MetaMask ERC-7710 Delegation** | Every onchain action is a 7710 redemption. The smart account delegates a USDC transfer scope to 1Shot's executor; the relayer redeems and broadcasts. The canonical schema is reverse-engineered live in [`SPIKE.md`](./SPIKE.md). |
| **EIP-6963 multi-wallet discovery** | `frontend/app/lib/wallet-discovery.ts` listens for `eip6963:announceProvider` and renders our own wallet picker. The user picks MetaMask explicitly rather than getting whichever wallet won the `window.ethereum` race. |
| **1Shot Permissionless Relayer** | Every onchain transaction — 7702 upgrade, 7710 redemption, USDC transfer — is broadcast by `relayer.1shotapi.com`. Fees paid in USDC. No private relayer required. |
| **1Shot fee batching** | `packages/core/src/oneshot/settle.ts` batches two executions per redemption: the fee transfer to the collector and the work transfer. Discovered by probing the relayer ("No valid payments to feeAddress" without it). |
| **x402 + ERC-7710 facilitator** | `apps/merchants` returns canonical x402 v2 accepts payloads on `/quote → 402`; `apps/agent` signs EIP-3009 payment headers via `@delegate/core` and posts them to `/charge`. Settlement leg redeems a 7710 delegation in the same tx. |
| **Venice text** | Daily decision reasoning (strict JSON `{action, confidence, reason}`) + Friday Brief composition. |
| **Venice image** | Friday Brief stylised spending chart (WEBP). |
| **Venice audio** | Friday Brief 60-second TTS narration (MP3). |
| **Venice x402 (wallet-auth, no API key)** | The agent pays for inference by signing an EIP-3009 USDC transferWithAuthorization. The same wallet that pays merchants also pays Venice. `packages/core/src/venice/payment.ts` builds the x402 v2 payment header live. |

---

## 5. Architecture

```
+--------------------------- BROWSER ---------------------------+
| Next.js 16 dashboard (Tailwind 4 + Framer Motion + lucide)   |
| - Editorial hero w/ live USDC balance + recent activity      |
| - EIP-6963 wallet picker (our own modal, no wallet land grab)|
| - ERC-7715 grant flow via @metamask/smart-accounts-kit       |
| - Live decision feed (SSE) + filter chips                    |
| - Friday Brief panel (text + image + audio)                  |
| - Toast notifications · keyboard shortcuts · copy buttons    |
+-------------------+------------------------------------------+
                    | HTTP + Server-Sent Events
                    v
+--------------------------- AGENT -----------------------------+
| apps/agent (Node 20 / Express)                               |
|                                                              |
|  +-- runTick (cron + on-demand)                              |
|  |     1. list services                                      |
|  |     2. fetch /quote -> 402                                |
|  |     3. Reasoner -> Venice text strict JSON                |
|  |     4. payMerchant: EIP-3009 sign -> /charge              |
|  |     5. settleOnchain (optional): 1Shot 7710 + 7702        |
|  |     6. emit bus events                                    |
|  |                                                           |
|  +-- /friday-brief                                           |
|        Venice text + image + audio  ->  one JSON payload     |
|                                                              |
|  +-- /decisions, /events (SSE), /admin/run-tick              |
+--------+----------------------+------------------------------+
         |                      |
         | x402 HTTP            | JSON-RPC
         v                      v
+----------------+    +-----------------------+
| apps/merchants |    | 1Shot relayer         |
| - /quote -> 402|    | relayer.1shotapi.com  |
| - /charge      |    | gas in USDC           |
| - /admin/arm   |    | 7702 + 7710 in-flight |
+----------------+    +-----------------------+
                              |
                              v
                       Base mainnet (8453)
```

Shared primitives live in [`packages/core`](./packages/core):
- `chain/` — plain Base definition + `getBaseContract(name)` against `@metamask/delegation-deployments` v1.3.0.
- `oneshot/relayer.ts` — JSON-RPC client (`getCapabilities`, `getFeeData`, `send7710Transaction`, `getStatus`).
- `oneshot/settle.ts` — `settleOnchain()` builds the delegation, signs it, batches fee + work executions, and submits.
- `venice/siwe.ts` — Sign-In-With-X auth header.
- `venice/payment.ts` — EIP-3009 transferWithAuthorization wrapped in the x402 v2 payment payload.
- `venice/client.ts` — typed wrapper for chat, image, audio.

---

## 6. Repo layout

```
metamask-sa/
├── apps/
│   ├── agent/        Reasoning loop + Express HTTP/SSE server
│   └── merchants/    Mock x402 services (netflix-mock, spotify-mock, …)
├── packages/
│   └── core/         Chain, 1Shot relayer client, Venice x402 client
├── frontend/         Next.js 16 dashboard — see frontend/README.md
├── spike/            Day-0/1 reverse-engineering scripts (kept for reference)
├── PROPOSAL.md       Strategic deep dive (idea exploration, judge critique)
├── SPIKE.md          Foundation findings + canonical 1Shot schema
└── README.md         You are here.
```

---

## 7. Local setup from scratch

Prerequisites: Node 20+, pnpm 10, a Base-mainnet RPC URL.

```bash
# 1. Install
pnpm install

# 2. Configure secrets
cp .env.example .env
# Fill in:
#   SPIKE_PRIVATE_KEY                burner EOA (never reuse a personal key)
#   ONCHAIN_SETTLEMENT_MODE=dust     enable real 1Shot 7710 settlement per PAY
#   ONCHAIN_DUST_MICRO_USDC=10000    0.01 USDC dust transfer per settlement
#   SETTLEMENT_RECIPIENT=0x…         where the dust transfer lands (default: burn)
#
# Fund the burner with:
#   ~$5 USDC on Base for 1Shot fees + dust transfers
#   ~$5 USDC for the Venice x402 top-up (covers an entire build)
#   Cheapest route: bridge USDC Ethereum -> Base via https://relay.link

# 3. (One-time, ~$5 USDC) prime Venice credit via x402
pnpm spike:venice-topup

# 4. Run the stack (3 terminals — see §2.1).
```

The Day-0/1 verification scripts that proved every primitive in isolation are still in `spike/` and runnable:

```bash
pnpm spike:1shot          # 1Shot relayer reachability + capabilities + fee quote
pnpm spike:venicex402     # Venice SIWE auth + payment-requirements probe
pnpm spike:7715           # ERC-7715 payload shape check
pnpm spike:first7710      # End-to-end 7702 upgrade + first 7710 redemption (spend)
pnpm spike:venice-topup   # $5 USDC top-up to Venice via x402 (spend)
pnpm spike:webhook        # Local webhook receiver (pair with ngrok)
pnpm spike:venice         # Bearer-key smoke test (legacy fallback)
pnpm spike:7702           # Standalone 7702 upgrade attempt (legacy)
```

See [`SPIKE.md`](./SPIKE.md) for the canonical schemas the spikes discovered.

---

## 8. What's real, what's mocked

We are explicit. Hackathon judges should know exactly what they're looking at.

**Real, onchain, verifiable:**
- The 7702 upgrade of the burner.
- Every ERC-7710 redemption from `apps/agent` settlement mode.
- Every 1Shot relayer call (capabilities, fee quotes, broadcasts).
- The Venice x402 top-up — $5 USDC moved onchain to Venice.
- Venice inference calls authenticated by the burner wallet (no API key).
- Decision reasoning is real Venice text output, not canned.
- The ERC-7715 grant prompt opens the actual MetaMask extension popup with the requested caveats.
- EIP-6963 multi-wallet discovery — the picker enumerates every wallet the browser exposes.

**Mocked for the demo:**
- The five merchant services (`netflix-mock`, `spotify-mock`, etc.) are local Express endpoints. They implement the x402 v2 protocol correctly, but no Netflix/Spotify integration exists. The agent treats them like any x402 merchant.
- The agent and the "user" share one EOA for the demo. In production, the agent runs as a separate session account that redeems against the user's 7715 grant. The frontend already builds the grant against a distinct `SESSION_ACCOUNT_ADDRESS` — wiring the agent runtime to the same session signer is the next step.
- The anomaly trigger is a `POST /admin/arm-anomaly/<slug>` button. The rule engine and the Venice model both evaluate the inflated quote — the trigger only inflates the next /quote response.
- The dust settlement transfers 0.01 USDC instead of the quoted full price so a demo session doesn't burn the budget. The redemption itself is identical to a full-price one.

---

## 9. Track-by-track checklist

**Best Agent**
- [x] MetaMask Smart Accounts integrated in the main flow (every payment).
- [x] Working integration shown in demo (dashboard live with SSE feed).
- [x] 1Shot API usage in demo (every settlement).
- [x] Autonomous reasoning loop with structured Venice output (not a cron with if-else).

**Best x402 + ERC-7710**
- [x] x402 v2 quote/charge protocol implemented end-to-end (merchants + agent).
- [x] ERC-7710 delegation redeemed for every settlement.
- [x] 1Shot relay on Base mainnet — see §3.
- [x] Reusable x402+7710 facilitator in `packages/core/src/oneshot/settle.ts`.

**Best use of Venice AI**
- [x] Qualifies via Best Agent + Best x402+7710.
- [x] Venice as core part of the application (every decision + every brief).
- [x] Multiple Venice endpoints in main flow: **text + image + audio** (Friday Brief).
- [x] Meaningful AI output (decisions, refusals, the full digest).
- [x] Bonus: Venice paid via x402 wallet auth, no API key — matches the explicit Venice + x402 scoring multiplier.

**Best Use of 1Shot Permissionless Relayer**
- [x] ERC-7710 transactions relayed through the public 1Shot mainnet relayer.
- [x] ERC-7702 authorization used to upgrade the EOA via 1Shot on first redemption.
- [x] Canonical x402+7710 facilitator pattern lives in `packages/core/src/oneshot/settle.ts`.

---

## 10. Roadmap

| Status | Item |
|---|---|
| ✅ | Day-0/1 primitive verification (spike 01–08) |
| ✅ | `@delegate/core` package (chain, 1Shot, Venice, settle) |
| ✅ | `apps/merchants` (x402 v2 server) |
| ✅ | `apps/agent` (reasoning + payments + HTTP/SSE) |
| ✅ | `apps/agent` onchain settlement via 1Shot |
| ✅ | `frontend` live dashboard |
| ✅ | Friday Brief (Venice text + image + audio) |
| ✅ | ERC-7715 grant UI in the MetaMask extension flow |
| ✅ | EIP-6963 multi-wallet discovery + in-app picker |
| ✅ | Toast notifications, keyboard shortcuts, decision filters |
| ⏳ | Wire the agent runtime to use the granted session account |
| ⏳ | Onchain reputation attestations per receipt |
| ⏳ | Persistent storage (Postgres) replacing the in-memory store |
| ⏳ | 1Shot webhook → SSE bridge for tx confirmations |
| ⏳ | Public registry of x402 merchants |

---

## 11. Reading order

1. **[`README.md`](./README.md)** — you are here. The shipped product, evidence, setup.
2. **[`frontend/README.md`](./frontend/README.md)** — dashboard internals (components, hooks, env vars, keyboard shortcuts).
3. **[`SPIKE.md`](./SPIKE.md)** — every architectural finding from Day-0/1 (canonical schemas, address pinning, version pins).
4. **[`PROPOSAL.md`](./PROPOSAL.md)** — the original strategic deep dive: idea exploration across 15 candidates, why DeleGate.AI won the deliverability pass, judge-level critique with mitigations.
5. **[`requirement.md`](./requirement.md)** — the hackathon brief, mirrored verbatim.

---

<div align="center">

*Built for the MetaMask Smart Accounts Kit × 1Shot API × Venice AI Dev Cook Off — Base mainnet, no shortcuts.*

</div>
