<div align="center">

  <img src="frontend/public/lm-removebg-preview.png" width="92" alt="DeleGate.AI" />

  # DeleGate.AI

  **Your AI chief of staff for onchain money.**
  Bounded · Revocable · Multimodal.

  An autonomous agent that pays your subscriptions over x402, refuses
  anomalies in real time, settles through ERC-7710 on Base, and ships a
  multimodal Friday Brief. One scoped MetaMask permission. Nothing custodial.

  [**Live dashboard →**](https://delegate-appsfrontend.vercel.app/)
  · [Agent API](https://delegateagent-production.up.railway.app/)
  · [Merchants API](https://delegatemerchants-production.up.railway.app/)
  · [Source](https://github.com/EzraNahumury/metamask-sa)

  <br />

  ![Base](https://img.shields.io/badge/Base-mainnet%20·%208453-0052FF?style=flat)
  ![ERC-7702](https://img.shields.io/badge/ERC-7702-111?style=flat)
  ![ERC-7710](https://img.shields.io/badge/ERC-7710-111?style=flat)
  ![ERC-7715](https://img.shields.io/badge/ERC-7715-111?style=flat)
  ![x402 v2](https://img.shields.io/badge/x402-v2-111?style=flat)
  ![1Shot](https://img.shields.io/badge/1Shot-permissionless%20relayer-7c3aed?style=flat)
  ![Venice](https://img.shields.io/badge/Venice-text·image·audio-10b981?style=flat)

  <sub>Submission for the **MetaMask Smart Accounts Kit × 1Shot API × Venice AI Dev Cook Off** —
  targeting Best Agent · Best x402 + ERC-7710 · Best use of Venice AI · Best Use of 1Shot Permissionless Relayer.</sub>

</div>

---

## At a glance

| Question | Answer |
|---|---|
| What is it? | An autonomous reasoning agent that pays your subscriptions in USDC, refuses anomalies, and writes a Friday Brief — under a scoped MetaMask permission. |
| Where does it run? | Base mainnet (chain 8453). |
| What pays for what? | x402 quotes from merchants. Venice reasoning paid by the same wallet over x402. 1Shot relays every ERC-7710 redemption — fees in USDC, no ETH. |
| Why does it qualify? | Real ERC-7702 upgrade, real ERC-7715 grant flow in MetaMask, real ERC-7710 redemption per PAY, three Venice endpoints, all wired to 1Shot. |

---

## See it in 60 seconds

1. Open the [live dashboard](https://delegate-appsfrontend.vercel.app/) — the status pill turns green when the SSE stream connects.
2. Section **01 Activate** → connect MetaMask via the in-app EIP-6963 picker, pick a `$2/wk` cap, sign the ERC-7715 grant.
3. Hit `T` (or **Run tick** in section 03) — five decisions stream into the feed with real Venice reasoning and basescan tx links.
4. Click **Arm netflix** then `T` again — Netflix-mock is REFUSED in real time, the others still PAY.
5. Hit `F` (or section 04) — **Generate Friday Brief** — text + chart image + audio narration in one Venice round trip.

Keyboard shortcuts hinted in section headers: `G` Activate · `T` Tick · `F` Friday Brief.

---

## Onchain evidence

Six real Base mainnet transactions, broadcast by the public 1Shot relayer on behalf of the burner smart account [`0x5Aea…2f5d`](https://basescan.org/address/0x5Aea061d814A72de9EE9171bE86F45f48e1E2f5d).

| What | Tx |
|---|---|
| **ERC-7702 upgrade + first ERC-7710 redemption** | [`0xf199…6052c`](https://basescan.org/tx/0xf199a88f1f7e2d28005365acd5ba63793d166c6b1d94cf77a2a807f53746052c) |
| Netflix-mock dust settlement | [`0x4f21…72714`](https://basescan.org/tx/0x4f219452a2f531d482828b76411d641056ac04df41c31713ee44422f71072714) |
| Spotify-mock dust settlement | [`0xbf3a…58156`](https://basescan.org/tx/0xbf3ad3ebd8b077ec7310500f79b0e04481d8df9b69bd4a594389567aaa458156) |
| Substack-mock dust settlement | [`0xa7b1…20fb0`](https://basescan.org/tx/0xa7b180838fbb37976045e77daa421dfe224cafdbaa15384a1ed2e80816320fb0) |
| Domain-mock dust settlement | [`0x4bbc…85839`](https://basescan.org/tx/0x4bbc81bd6385be4317ce905a7ec7ed4b2b5f5eef41e821f3d6f60a4a59085839) |
| ChatGPT-mock dust settlement | [`0xdd51…cd833f`](https://basescan.org/tx/0xdd5134d6126446d41fe723c6edf9c771be06c1a836d3fd1444782bfd4ecd833f) |

Each settlement batches **two USDC transfers** inside one ERC-7710 redemption — the relayer fee to 1Shot's collector and the dust transfer to the merchant. Verify on basescan: no paymaster, no ETH, no API keys.

Venice was funded once via x402 (paymentId `x402-fa4cdc720ee353dd072d31e7c4c5b167`) — every inference call since then is paid from that on-chain credit.

---

## Architecture

```
┌────────────────────────── BROWSER ──────────────────────────┐
│  Next.js 16 dashboard · Tailwind 4 · Framer Motion          │
│  • EIP-6963 wallet picker  • ERC-7715 grant via Smart       │
│    Accounts Kit  • SSE feed  • Friday Brief multimodal      │
│  • Toasts · keyboard shortcuts · live USDC balance read     │
└───────────────────┬─────────────────────────────────────────┘
                    │ HTTP + Server-Sent Events
                    ▼
┌────────────────────────── AGENT ────────────────────────────┐
│  Node 20 · Express · pnpm workspace                         │
│                                                             │
│  runTick (cron + on-demand)                                 │
│    1. list merchant services                                │
│    2. fetch /quote → HTTP 402                               │
│    3. Reasoner → Venice text (strict JSON)                  │
│    4. payMerchant: sign EIP-3009 → POST /charge             │
│    5. settleOnchain: 1Shot ERC-7710 + ERC-7702 in-flight    │
│    6. emit SSE events                                       │
│                                                             │
│  GET /friday-brief — Venice text + image + audio            │
│  GET /decisions, /events (SSE), POST /admin/run-tick        │
└───────┬──────────────────────────────┬──────────────────────┘
        │ x402 HTTP                    │ JSON-RPC
        ▼                              ▼
┌──────────────────┐         ┌────────────────────────────────┐
│  MERCHANTS       │         │  1Shot permissionless relayer  │
│  /quote → 402    │         │  relayer.1shotapi.com          │
│  /charge         │         │  gas in USDC                   │
│  /admin/arm-anom │         │  7702 + 7710 in-flight         │
└──────────────────┘         └────────────────────────────────┘
                                          │
                                          ▼
                                   Base mainnet · 8453
```

Shared primitives live in [`packages/core`](./packages/core):
- `chain/` — Base via `defineChain`, addresses pinned against `@metamask/delegation-deployments` v1.3.0.
- `oneshot/relayer.ts` — JSON-RPC client for the public 1Shot relayer.
- `oneshot/settle.ts` — `settleOnchain()` builds + signs the delegation, batches `fee + work` executions.
- `venice/payment.ts` — EIP-3009 transferWithAuthorization wrapped in x402 v2.
- `venice/client.ts` — typed wrapper for chat, image, audio (auth via wallet SIWE).

---

## Sponsor primitives, audited honestly

| Primitive | Where it lives |
|---|---|
| **MetaMask Smart Accounts** | EOA upgraded to a Smart Account via ERC-7702 in-flight on the first 1Shot redemption. |
| **ERC-7715 Advanced Permissions** | `frontend/app/components/OnboardingPanel.tsx` opens the MetaMask popup via `requestExecutionPermissions`; caveats persisted in localStorage. |
| **ERC-7710 Delegation** | Every onchain action is a 7710 redemption (smart account → 1Shot executor, ERC-20 transfer scope). |
| **EIP-6963 multi-wallet discovery** | In-app picker so MetaMask is selected explicitly, not by `window.ethereum` race. |
| **1Shot permissionless relayer** | Every onchain tx routed through `relayer.1shotapi.com`. Fees paid in USDC. |
| **1Shot fee batching** | `packages/core/src/oneshot/settle.ts` batches `fee + work` per redemption — discovered live in the spike log. |
| **x402 + ERC-7710 facilitator** | Merchants return canonical x402 v2 accepts; agent signs EIP-3009; settlement leg redeems a 7710 delegation in the same tx. |
| **Venice text · image · audio** | Daily reasoning + Friday Brief composition + chart + TTS narration. |
| **Venice x402 (no API key)** | Inference paid by the same wallet that pays merchants — no Bearer token, no Venice account. |

---

## Track-by-track checklist

**Best Agent** · **Best x402 + ERC-7710** · **Best use of Venice AI** · **Best Use of 1Shot Permissionless Relayer**

- [x] MetaMask Smart Accounts integrated in the main flow (every payment).
- [x] x402 v2 quote/charge protocol end-to-end (merchants ↔ agent).
- [x] ERC-7710 delegation redeemed for every settlement.
- [x] ERC-7715 grant prompt in the MetaMask extension popup (live).
- [x] 1Shot relays every onchain action on Base mainnet.
- [x] ERC-7702 authorization upgrades the EOA via 1Shot on the first redemption.
- [x] Three Venice endpoints in the main flow: text + image + audio (Friday Brief).
- [x] Venice paid via x402 wallet auth (Venice + x402 bonus multiplier).
- [x] Canonical x402+7710 facilitator pattern reusable in `packages/core/src/oneshot/settle.ts`.

---

## Run locally

```bash
# 1. Install
pnpm install

# 2. Configure secrets
cp .env.example .env
# Required:
#   SPIKE_PRIVATE_KEY                burner EOA (never reuse a personal key)
#   ONCHAIN_SETTLEMENT_MODE=dust     enable real 1Shot settlement per PAY
#
# Fund the burner with ~$5 USDC on Base for relayer fees + settlements
# and prime Venice once via x402:
pnpm spike:venice-topup

# 3. Boot the three services (three terminals)
pnpm --filter @delegate/merchants run start
pnpm --filter @delegate/agent     run start
pnpm --filter frontend            run dev
```

Open <http://localhost:3000>.

For production deployment to Railway + Vercel, see [`DEPLOY.md`](./DEPLOY.md).
For the full spike CLI surface (8 scripts that proved every primitive in isolation), see [`SPIKE.md`](./SPIKE.md).

---

## What's real, what's mocked

**Real, onchain, verifiable.**
- ERC-7702 upgrade of the burner.
- Every ERC-7710 redemption when `ONCHAIN_SETTLEMENT_MODE=dust`.
- Every 1Shot relayer call (capabilities, fee quotes, broadcasts).
- The Venice x402 top-up — 5 USDC moved onchain to Venice.
- Venice inference paid by the wallet (no API key).
- The ERC-7715 grant prompt — the actual MetaMask extension popup with the requested caveats.
- EIP-6963 multi-wallet discovery — every wallet the browser exposes.

**Mocked for the demo.**
- Five merchant services are local Express endpoints implementing the x402 v2 protocol correctly; no Netflix/Spotify integration exists.
- Agent and "user" share one EOA. In production the agent runs as a separate session account redeeming against the user's 7715 grant; frontend already targets a distinct `SESSION_ACCOUNT_ADDRESS`.
- Anomaly trigger is a button; the rule engine + Venice that evaluate the inflated quote are real.
- Dust settlements transfer 0.01 USDC instead of the quoted full price so a demo session doesn't burn the budget — the redemption itself is identical to a full-price one.

---

## Repository

```
metamask-sa/
├─ apps/
│  ├─ agent/         Reasoning loop + HTTP/SSE server (Express)
│  └─ merchants/     Mock x402 services (5 mocks, anomaly trigger)
├─ packages/
│  └─ core/          Chain · 1Shot · Venice · settleOnchain
├─ frontend/         Next.js 16 dashboard
├─ landingpage/      Vite + React marketing site
├─ smartcontract/    Foundry scaffold (post-MVP DeleGate contracts)
├─ spike/            Day-0/1 reverse-engineering scripts
├─ DEPLOY.md         Railway + Vercel walkthrough
├─ SPIKE.md          Canonical schemas + architectural findings
├─ PROPOSAL.md       Original strategic deep dive
└─ requirement.md    Hackathon brief (mirrored)
```

---

## Roadmap

| Status | Item |
|---|---|
| ✅ | Day-0/1 primitive verification (spike 01–08) |
| ✅ | `@delegate/core` package |
| ✅ | `apps/merchants` x402 v2 server |
| ✅ | `apps/agent` reasoning loop + onchain settlement |
| ✅ | Live dashboard (toasts · filters · shortcuts) |
| ✅ | Friday Brief (text + image + audio) |
| ✅ | ERC-7715 grant UI · EIP-6963 picker |
| ✅ | Deployed: Vercel + Railway · documented in `DEPLOY.md` |
| ⏳ | Agent runtime uses the granted session account (currently shares the burner) |
| ⏳ | Onchain reputation attestations per receipt |
| ⏳ | Postgres replacing in-memory store |
| ⏳ | 1Shot webhook → SSE bridge for tx confirmations |
| ⏳ | Public registry of x402 merchants |

---

## Reading order

1. **README.md** — you are here. The shipped product, the evidence, the URLs.
2. [`frontend/README.md`](./frontend/README.md) — dashboard internals (components, hooks, env vars, keyboard shortcuts).
3. [`SPIKE.md`](./SPIKE.md) — every architectural finding from Day-0/1.
4. [`DEPLOY.md`](./DEPLOY.md) — Railway + Vercel walkthrough.
5. [`PROPOSAL.md`](./PROPOSAL.md) — the original strategic deep dive.
6. [`requirement.md`](./requirement.md) — hackathon brief, verbatim.

---

<div align="center">

  <sub>Built for the MetaMask Smart Accounts Kit × 1Shot API × Venice AI Dev Cook Off — Base mainnet, no shortcuts.</sub>

</div>
