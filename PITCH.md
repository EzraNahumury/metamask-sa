# DeleGate.AI — Pitch Deck

10 slides. Copy each section into a PowerPoint slide.

---

## Slide 1 — Cover

**Title:** DeleGate.AI

**Subtitle:** Your AI chief of staff for onchain money — bounded, revocable, multimodal.

**Footer:** Submission · MetaMask Smart Accounts Kit × 1Shot API × Venice AI Dev Cook Off

**Visual:** Logo center · gradient background · live URL `delegate-appsfrontend.vercel.app`

---

## Slide 2 — The Problem

**Headline:** Every AI agent today is either useless… or owns your wallet.

**Body:**

- Stripe-style cards give agents **unrestricted spend**. One bad prompt = drained card.
- Allowance approvals **leak**. "Infinite approve" is the standard, not the exception.
- AI assistants with seed phrase access = **all-or-nothing custody**.
- Kill switch today = "call customer support". Days, not seconds.

**Killer stat:** $240/mo average creator stack on AI subs — and zero of it is bounded onchain.

**Visual:** Two bad UX screenshots side-by-side · red X marks

---

## Slide 3 — The Solution

**Headline:** One signature. One budget. Every payment bounded onchain.

**Body:**

DeleGate.AI is an autonomous reasoning agent under a single MetaMask permission:

- User signs **one ERC-7715 grant** — weekly cap, expiry, allowed callees.
- Agent reads HTTP 402 quotes, asks Venice to reason about every price.
- Approved payments settle via **real ERC-7710 redemptions** through 1Shot.
- Every Friday: a **multimodal brief** (text + image + audio) from Venice.
- **Revocable in one tap.** Onchain. Always.

**Visual:** 3-icon row — Sign · Reason · Settle

---

## Slide 4 — How It Works

**Headline:** The flow, in five beats.

**Body:**

1. **Connect** — EIP-6963 wallet picker (our own, not the wallet's).
2. **Grant** — ERC-7715 advanced permission prompt in MetaMask. Caveats: cap, expiry, callees.
3. **Tick** — Agent walks the catalog, fetches `402` from each service, Venice decides PAY / REFUSE / ESCALATE.
4. **Settle** — Smart Account delegates a USDC transfer to 1Shot's executor. Relayer broadcasts. Two transfers per redemption: fee + work.
5. **Brief** — One Venice round trip returns text + WEBP chart + MP3 narration.

**Visual:** Numbered timeline · code-style monospace labels

---

## Slide 5 — Architecture

**Headline:** Every primitive earns its place.

**Diagram:**

```
Browser (Next.js 16 · SSE · MetaMask)
        │
        ▼
Agent (Node · Express · BullMQ tick)
   │            │
   │ HTTP x402  │ JSON-RPC
   ▼            ▼
Merchants     1Shot Relayer
              ▼
        Base mainnet 8453
              │
              ▼
          Venice
```

**Subtitle:** Shared primitives in `packages/core` — chain, oneshot, venice, settle.

**Visual:** Above diagram as a clean SVG flow

---

## Slide 6 — Sponsor Primitives

**Headline:** Audited honestly. No primitive is decoration.

| Primitive | Where it lives |
|---|---|
| **MetaMask Smart Accounts** | EOA upgraded via ERC-7702 in-flight |
| **ERC-7715 Advanced Permissions** | Live in the MetaMask extension popup |
| **ERC-7710 Delegation** | Every onchain action |
| **EIP-6963 multi-wallet discovery** | In-app picker |
| **1Shot permissionless relayer** | Every onchain tx, gas in USDC |
| **x402 + ERC-7710 facilitator** | Reusable in `packages/core/src/oneshot/settle.ts` |
| **Venice text · image · audio** | Friday Brief — three endpoints, one call |
| **Venice x402 (no API key)** | Inference paid by the wallet |

---

## Slide 7 — Proof on Base

**Headline:** Six real transactions. Verify any of them.

**Burner smart account:** `0x5Aea…2f5d`

| What | Tx (short) |
|---|---|
| ERC-7702 upgrade + first 7710 redemption | `0xf199…6052c` |
| Netflix-mock settlement | `0x4f21…72714` |
| Spotify-mock settlement | `0xbf3a…58156` |
| Substack-mock settlement | `0xa7b1…20fb0` |
| Domain-mock settlement | `0x4bbc…85839` |
| ChatGPT-mock settlement | `0xdd51…cd833f` |

**Subtitle:** Each settlement batches two USDC transfers in one ERC-7710 redemption — fee + work. No paymaster. No ETH.

**Visual:** Basescan screenshot zoomed on one tx, showing two `Transfer` events

---

## Slide 8 — Live Demo

**Headline:** Try it now.

**Body:**

- **Dashboard:** `https://delegate-appsfrontend.vercel.app/`
- **Agent API:** `https://delegateagent-production.up.railway.app/`
- **Merchants API:** `https://delegatemerchants-production.up.railway.app/`
- **Source:** `github.com/EzraNahumury/metamask-sa`

**90-sec walkthrough:**

1. Connect MetaMask via in-app picker
2. Sign $2/wk ERC-7715 grant
3. Press `T` → 5 decisions stream live
4. Arm netflix-mock anomaly → agent refuses at 32×
5. Press `F` → Friday Brief renders in three modalities

**Visual:** Dashboard hero screenshot · QR code to live URL

---

## Slide 9 — Roadmap

**Headline:** Shipped today. Building tomorrow.

**Shipped (✅):**

- Foundation spike (01–08): chain selection, schema reverse-engineering, kit pinning
- `@delegate/core` — chain, 1Shot client, Venice x402 client, settle
- Mock x402 v2 merchants
- Reasoning agent + HTTP/SSE + onchain settlement
- ERC-7715 grant UI + EIP-6963 picker
- Friday Brief (text + image + audio)
- Live deploy to Vercel + Railway

**Building (⏳):**

- Agent runtime uses the granted session account (decoupled from burner)
- Onchain reputation attestations per receipt
- Postgres replacing in-memory store
- 1Shot webhook → SSE bridge
- Public x402 merchant registry

---

## Slide 10 — The Ask

**Headline:** Hire an agent. Keep the keys.

**Body:**

DeleGate.AI is the reference implementation of agentic finance on Base — one MetaMask signature, one bounded budget, four sponsor primitives composed into a real product judges can verify onchain in 60 seconds.

**Tracks we're going for:**

- 🏆 Best Agent
- 🏆 Best x402 + ERC-7710
- 🏆 Best use of Venice AI
- 🏆 Best Use of 1Shot Permissionless Relayer

**Closing line:** *This is what agentic finance was supposed to feel like.*

**Visual:** Logo · URLs · GitHub QR · social handle

---

## Design notes (for the PPT)

| Aspect | Recommendation |
|---|---|
| Slide count | 10 (cover + 8 content + closing) |
| Aspect ratio | 16:9 |
| Font (display) | Inter / Space Grotesk / Geist |
| Font (mono) | JetBrains Mono / Geist Mono |
| Palette | Off-black `#0a0b10` bg · Emerald `#10b981` accent · White text · Amber `#f59e0b` warnings only |
| Slide titles | 48–60 pt, semibold, left-aligned |
| Body text | 18–22 pt, regular, 1.5 line height |
| Code / mono | 14–18 pt, JetBrains Mono, on dark slate fill |
| Logos | Top-left every slide (small, 32 px) |
| Page numbers | Bottom-right, mono, `01 / 10` style |
| Animations | Minimal — fade in, no flying text |
| Per-slide read time | 30–45 sec presenting |
| Total deck length | 5–7 min presented · 2 min skim |

## Optional appendix slides

If the venue gives more time:

- Architecture deep-dive (`packages/core` module map)
- Cost breakdown (Venice credit, USDC settlements, gas math)
- Why Base (vs Ethereum, vs Celo, vs Sepolia)
- Schema reverse-engineering story (the spike-by-spike log from SPIKE.md)
- Failure-mode demo (anomaly catch, kill-switch revoke)
