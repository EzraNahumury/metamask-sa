<div align="center">

# DeleGate.AI
### Your AI Chief of Staff for onchain money — bounded, revocable, and finally trustworthy.

*Submission for the* ***MetaMask Smart Accounts Kit × 1Shot API × Venice AI Dev Cook Off***

**Target prize tracks**
`Best Agent` (primary) · `Best x402 + ERC-7710` (primary) · `Best Use of Venice AI` (bonus) · `Best Use of 1Shot Permissionless Relayer` (bonus)

**Realistic stackable prize ceiling: $5,000**

</div>

---

## 0. The 30-second pitch

You hand your AI agent **one** thing: a weekly USDC budget with a hard cap, an expiry, and a list of services it is allowed to pay. That's it. No card, no seed phrase, no "trust me bro".

DeleGate.AI then becomes your **autonomous chief of staff for money**. Every week it:

1. Reviews every subscription you've authorized.
2. Decides — out loud, with Venice-powered reasoning — whether to pay, cancel, or escalate.
3. Pays approved invoices via **x402** using its **ERC-7710 redelegation** from your **MetaMask Smart Account**.
4. Files a **weekly digest** as text + a generated chart image + a voice-narrated summary (three Venice endpoints, one report).
5. Flags anomalies the moment they happen — a 10× price jump, an unknown callee, a suspicious quote — and **refuses to pay** until you approve.

When the budget expires, the leftover automatically comes back to you. When you want to revoke, one tap kills the agent's authority instantly.

This is what "AI agent with a wallet" was supposed to mean.

---

## 1. Hackathon Deconstruction — what the sponsors actually want

| Sponsor | Their stated track | What they secretly want | How DeleGate.AI delivers |
|---|---|---|---|
| **MetaMask** | Smart Accounts / ERC-7715 advanced permissions in main flow | Proof that delegations make agentic UX **safe and pleasant**, not janky. They are not paying $9K to see another DEX. | Every action the agent takes is a **scoped, expiring, revocable** delegation. Revocation is a one-tap front-and-center feature, not a buried setting. |
| **1Shot API** | Permissionless relayer + 7702 upgrade + 7710 mainnet relay + webhooks | A **flagship reference** for the x402↔7710 facilitator pattern hinted at in their docs. | Our agent **is** an x402↔7710 facilitator. Every onchain action — 7702 upgrade, delegation, payment, revocation — is broadcast via 1Shot. Gas paid in USDC. Webhooks drive UI state. |
| **Venice AI** | Permissionless intelligence across many endpoints | Demos that exploit **multiple endpoints**, not just `chat.completions`. | Our weekly digest uses **text** (reasoning), **image** (generated spending chart), and **audio** (TTS narration). Anomaly detection uses Venice text with a guardrail prompt. |

**Why this combination is rare**: most teams will ship either a chat agent (no money), a DeFi bot (no intelligence layer), or a single-modality showcase (no breadth). DeleGate.AI is the only common-sense consumer story where MetaMask permissions, 1Shot relaying, and Venice multimodality all carry weight.

---

## 2. Idea Exploration — the 15 we considered

We generated 15 candidates across agent, security, DAO, social, creator, prediction-market, and infra angles. Scores out of 10.

| # | Name | One-liner | Wow | Demo impact | Difficulty | Verdict |
|---|---|---|---|---|---|---|
| 1 | **DeleGate.AI** | AI chief of staff with weekly budget caps | 8 | 9 | 4 | **WINNER — best risk-adjusted** |
| 2 | BRIGADE | Conductor hires specialist sub-agents via redelegation + x402 | 10 | 10 | 9 | High ceiling, high build risk → see Appendix |
| 3 | Hermes | A2A commerce / open agent registry | 8 | 6 | 7 | Too infra; no consumer story |
| 4 | Conclave | AI DAO governance delegates | 8 | 7 | 8 | Niche; judges may not feel it |
| 5 | Aegis | AI security guardian over 7715 grants | 8 | 8 | 7 | Defensive; awkward fit for Best Agent |
| 6 | Spectra | AI agent trading prediction markets | 6 | 7 | 5 | Generic; many will ship this |
| 7 | WitnessAI | Decentralized AI oracle network paid via x402 | 8 | 6 | 9 | Pure infra; demo is text walls |
| 8 | Genesis Studios | Creator-pipeline subset of BRIGADE | 8 | 9 | 6 | Subsumed by BRIGADE |
| 9 | Reverie | Overnight research/trade/brief agent | 6 | 6 | 5 | Many will ship this |
| 10 | Sherpa | Onboarding agent that walks you through first onchain action | 7 | 7 | 4 | Easy, but weak demo flex |
| 11 | Vault Whisperer | Dead-man-switch estate planning | 7 | 7 | 5 | Single-tx; emotional but thin |
| 12 | Cathedral | Multi-agent code review CI swarm | 7 | 6 | 7 | Niche dev tool |
| 13 | Echo | AI memecoin lore launchpad | 6 | 8 | 5 | Cringe risk |
| 14 | Praxis | AI legal assistant signing 7715 perms | 6 | 6 | 7 | Vague demo, no payment flow |
| 15 | OmniMesh | A2A interop layer across protocols | 7 | 5 | 9 | Pure infra |

### Why DeleGate.AI won on the second pass

The first pass picked BRIGADE (ceiling = $7K). On the **deliverability second pass**, BRIGADE's risk profile (6 specialist services, Venice video, 3-hop redelegation, swarm UI) is too aggressive for a small team in a 7-10 day window. DeleGate.AI keeps the same sponsor-primitive coverage with a **single-agent, single-user** scope that we can absolutely ship — and that we can absolutely demo without it breaking on stage.

**BRIGADE survives as the v2 vision** in the appendix: same architectural family, same payment substrate, same Venice stack. DeleGate.AI is BRIGADE's atomic unit. Ship the atom first.

---

## 3. Final Selection — DeleGate.AI deep breakdown

### 3.1 Identity

- **Name:** **DeleGate.AI**
- **Tagline:** *Your AI chief of staff for onchain money — bounded, revocable, and finally trustworthy.*
- **Elevator pitch (≤ 30 sec):**
  > "Every AI agent today either has none of your money or all of your money. DeleGate.AI sits in the middle. You give it a weekly USDC budget through a MetaMask ERC-7715 permission with hard caps and an expiry. It pays your subscriptions over x402, generates a weekly text + chart + voice digest, and flags any anomaly before it sends a single dollar. Revocable in one tap. This is what agentic finance is supposed to feel like."

### 3.2 The core problem

| Today's reality | Why it hurts |
|---|---|
| Stripe-style cards — agent gets all your money | One bad prompt drains everything |
| Allowance hacks — approve infinity to a contract | Same problem, worse — also onchain |
| Manual subscription audit — you do it yourself | $240/mo creator stack, no one reconciles |
| Anomaly detection — non-existent for agents | Agent silently overpays, you find out next month |
| Revoke = cancel card + call CS | Days, not seconds |

ERC-7715 (advanced permissions) + ERC-7710 (delegation) + x402 (HTTP payment) + 1Shot (gas in USDC) finally make a **bounded, revocable, accountable** money agent possible. DeleGate.AI is the consumer wrapper on top of those primitives.

### 3.3 Why this matters *now*

- ERC-7715 ships to mainstream MetaMask users imminently. The first **clear consumer narrative** for it sets the meme.
- Agent-payment standards (x402, Stripe Agent Toolkit, AP2) are racing for the substrate. The first product that **uses x402 in production for real value** earns reference-implementation status.
- Subscription fatigue is at all-time highs. A "kill switch with a brain" is something normies actually want.

### 3.4 Existing solutions and why they break

| Today | Why broken |
|---|---|
| Apple/Google subscription managers | Just a list. No reasoning. No revoke at the credential layer. |
| Mint, YNAB, Copilot | Read-only. Cannot act. Cannot refuse to pay. |
| Stripe Agent Toolkit | Account-level credentials. No scope, no caveats, no expiry. |
| AutoGPT / agent CLIs with seed phrase | Full custody. One bad prompt = drained. |
| Crypto subscription dApps (Sablier, Superfluid) | Pure streaming, no reasoning, no anomaly catch. |

### 3.5 Why DeleGate.AI is different

1. **Scope is enforceable onchain.** `maxSpend`, `expiresAt`, `allowedCallees` are caveats checked by the Delegation Framework. The agent literally **cannot** overspend.
2. **Refusal is a first-class feature.** Anomaly catch is not a warning email — it's an onchain non-payment with a Venice-generated justification.
3. **Reasoning is auditable.** Every decision the agent makes is logged with the Venice prompt + the structured output. You can read why it paid or didn't.
4. **Revocation is one tap.** A real onchain revoke tx, relayed by 1Shot. Receipt visible on Etherscan.
5. **Output is multimodal.** The weekly digest is a thing you'd actually open — text reasoning, a generated chart image, and a voice-narrated summary you can play in the kitchen.

---

## 4. The Three "Demo-Killer" Upgrades

These are the three details that turn DeleGate.AI from "competent" to "winner". Every one of them is included in the MVP.

### Upgrade 1 — Multi-service intelligence (the *agency* moment)

The agent does not pay a single thing. It manages a **portfolio of authorized services**:

- Netflix-mock (monthly)
- Spotify-mock (monthly)
- Substack-mock (annual)
- Domain renewal-mock (annual)
- ChatGPT Plus-mock (monthly)

At the end of each week, a **Venice text** agent runs a structured review:

> "Spotify-mock has had zero usage signals in the last 3 weeks. Recommend cancellation, saving $9.99/month. Confidence: 0.86. Awaiting one-tap approval."

This is **agent agency**, not a cron job. Judges feel the difference instantly.

### Upgrade 2 — Anomaly catch (the *holy-shit* moment)

A hardcoded demo scenario: Netflix-mock suddenly quotes **$500** instead of its normal $15.99. The agent:

1. Receives the `402` quote.
2. Compares against historical pricing in Postgres.
3. Sends quote + history to Venice text with a refusal-prompt template.
4. Refuses to pay. Emits an `AnomalyRefused` event onchain.
5. Pushes a notification: "I refused to pay Netflix-mock $500 (32× normal). Reason: pricing anomaly. Approve override?"

On stage, you trigger the bad quote with one button. The agent's refusal happens **live**, in **5 seconds**. That moment alone is worth a first-place vote.

### Upgrade 3 — Multimodal weekly digest (the *Venice scoring multiplier*)

Every Friday at 18:00, the agent generates a **Friday Brief**:

| Modality | Venice endpoint | What it produces |
|---|---|---|
| Text | `text/completions` | The weekly summary — what was paid, what was refused, what to cancel |
| Image | `image/generate` | A stylized spending chart for the week (no Chart.js required) |
| Audio | `audio/speech` | A 60-second narrated version you can play hands-free |

This single feature unlocks **three Venice endpoints** for the scoring bonus. The judge sees: "this team is treating Venice like the multimodal brain it is, not a chat completion."

---

## 5. User Journey (end-to-end)

```
[User opens DeleGate.AI, signs in with MetaMask Embedded Wallet (EOA)]
        │
        ▼
[App detects: not yet a smart account]
[One tap: "Activate DeleGate"]
   → ERC-7702 authorization signed
   → 1Shot Permissionless Relayer broadcasts the upgrade
   → Webhook fires "AccountUpgraded"
   → UI toast: "You upgraded your account without paying gas. 1Shot covered it in USDC."
        │
        ▼
[Budget setup wizard]
   - Weekly cap: $50 USDC (slider)
   - Expiry: 7 days (renewable)
   - Allowed callees: [Netflix-mock, Spotify-mock, Substack-mock, …]
        │
        ▼
[User signs ONE ERC-7715 advanced permission grant]
   caveats:
     - maxSpend       = $50/week
     - expiresAt      = now + 7d
     - allowedCallees = [registered services]
     - perCallCap     = $30
        │
        ▼
[Agent activates. Onchain delegation visible on Etherscan.]
        │
        ▼
─── Daily loop (autonomous) ────────────────────────────────────────
[For each due invoice]
   1. HTTP GET service /quote → returns 402 + quote
   2. Venice text reasons: "is this expected? within budget? unusual?"
   3. If anomaly → refuse, emit AnomalyRefused, notify user
   4. If approved → 1Shot relays payment via redelegation, gas in USDC
   5. Webhook updates UI in real time
────────────────────────────────────────────────────────────────────
        │
        ▼
─── Friday Brief (weekly) ───────────────────────────────────────────
   Venice text  → weekly reasoning + cancellation suggestions
   Venice image → spending chart for the week
   Venice audio → 60s narration
   Delivered to UI + downloadable
────────────────────────────────────────────────────────────────────
        │
        ▼
[User can revoke ANY time → 1-tap onchain revoke via 1Shot]
[Unspent budget returns automatically; expiry auto-revokes if untouched]
```

---

## 6. Technical Architecture

```
┌─────────────────────────────── FRONTEND ──────────────────────────────┐
│ Next.js 14 (App Router) · wagmi v2 · viem                             │
│ MetaMask Embedded Wallet (Dynamic SDK signer)                         │
│ TailwindCSS + shadcn/ui · Framer Motion · Recharts (read-side only)   │
└───────────────────────────────┬───────────────────────────────────────┘
                                │ tRPC + Server-Sent Events
┌───────────────────────────────▼───────────────────────────────────────┐
│                       CONTROL PLANE (Node 20)                        │
│ - Agent loop (BullMQ scheduled jobs, daily + weekly)                  │
│ - Venice client (text · image · audio)                                │
│ - x402 facilitator middleware                                         │
│ - 1Shot webhook receiver                                              │
│ - Anomaly detector (rule engine + Venice refusal prompt)              │
│ - Postgres (services, invoices, decisions, digests)                   │
└─────────────┬─────────────────────────────────────┬───────────────────┘
              │                                     │
   ┌──────────▼───────────────┐         ┌───────────▼──────────────┐
   │ MetaMask Smart Accounts  │         │ 1Shot Permissionless     │
   │ Kit (SDK)                │         │ Relayer (mainnet)        │
   │ - signer agnostic        │         │ - 7702 upgrade           │
   │ - DelegationManager      │         │ - 7710 broadcast         │
   │ - 7715 caveat builder    │         │ - gas in USDC            │
   │ - one-tap revoke         │         │ - webhooks (tx state)    │
   └──────────────────────────┘         └──────────────────────────┘
              │                                     │
              └──────────────────┬──────────────────┘
                                 │
                  ┌──────────────▼───────────────┐
                  │   MERCHANT-MOCK SERVICES     │
                  │ (x402-compliant endpoints)   │
                  │                              │
                  │ /netflix-mock                │
                  │ /spotify-mock                │
                  │ /substack-mock               │
                  │ /domain-mock                 │
                  │ /chatgpt-mock                │
                  │                              │
                  │ each: GET /quote → 402       │
                  │       POST /charge + proof   │
                  └──────────────────────────────┘
                                 │
                  ┌──────────────▼───────────────┐
                  │        VENICE AI API         │
                  │ text · image · audio         │
                  │ + crypto RPC for chain reads │
                  └──────────────────────────────┘
```

---

## 7. Sponsor primitive mapping (audit table)

The single slide we show the judges at second 30 of the demo.

| Sponsor primitive | Where it lives in DeleGate.AI |
|---|---|
| **MetaMask Smart Accounts** | The user's EOA is upgraded to a Smart Account via ERC-7702 on first run. |
| **MetaMask ERC-7715 Advanced Permissions** | The "Activate DeleGate" flow is a single 7715 prompt with `maxSpend`, `expiresAt`, `allowedCallees`, `perCallCap` caveats. |
| **MetaMask ERC-7710 Delegation** | The agent's daily payment flow re-derives a per-invoice redelegation from the 7715 grant. |
| **1Shot Permissionless Relayer** | Every onchain tx — 7702 upgrade, 7715 grant, every payment, every revoke, every anomaly event — is broadcast via 1Shot. Gas paid in USDC. |
| **1Shot webhooks** | `TransactionSubmitted` / `TransactionConfirmed` events drive the real-time UI state. No polling. |
| **x402 + ERC-7710 facilitator** | The DeleGate.AI control plane **is** an x402↔7710 facilitator. We open-source the module in `packages/facilitator`. |
| **Venice text** | Daily payment reasoning + weekly digest + anomaly refusal justifications. |
| **Venice image** | Friday Brief spending chart generation. |
| **Venice audio** | Friday Brief 60s TTS narration. |
| **Venice crypto RPC** | All chain reads (balances, gas estimates, block numbers) routed through Venice's crypto RPC. |

---

## 8. AI Architecture

### 8.1 The reasoning loop (daily)

```
for invoice in due_invoices:
    quote = http_get(invoice.service + "/quote")          # returns 402 + price
    context = {
        invoice,
        quote,
        history = postgres.priceHistory(invoice.service),
        remainingBudget,
        recentRefusals,
    }
    decision = venice.text.chat({
        model: "venice-default",
        messages: [
            SYSTEM_PROMPT,                                 # see § 8.2
            { role: "user", content: JSON.stringify(context) },
        ],
        response_format: { type: "json_schema", schema: DECISION_SCHEMA },
    })
    if decision.action == "PAY":
        oneshot.relay(redelegate(quote.amount, invoice.service))
    elif decision.action == "REFUSE":
        emit AnomalyRefused(decision.reason)
        notify(user, decision)
    elif decision.action == "ESCALATE":
        notify(user, decision)                             # waits for human
```

### 8.2 The Venice system prompt (excerpt)

```
You are DeleGate.AI, a chief-of-staff agent for onchain money.
You manage a delegated USDC budget on a MetaMask Smart Account.
For each invoice, decide: PAY | REFUSE | ESCALATE.
REFUSE if:
  - quoted price > 1.5× rolling-median of last 6 invoices for this service
  - service is not in allowedCallees
  - per-call cap would be exceeded
  - weekly budget would be exceeded
PAY only if all caveats and rules are satisfied.
ESCALATE if confidence < 0.7 or signals are mixed.
Always return: { action, amount, reason, confidence }.
```

### 8.3 The Friday Brief composer

```
weekly_text  = venice.text.chat(weekly_review_prompt(week_data))
chart_image  = venice.image.generate(prompt_from(week_data), size="1024x576")
audio_clip   = venice.audio.tts(weekly_text.summary, voice="warm-en")
deliver({ weekly_text, chart_image, audio_clip })
```

Three endpoints, one report. Clean.

---

## 9. Smart Contract Architecture

We **do not** rewrite core primitives. The MetaMask Delegation Framework does the heavy lifting. We deploy two minimal contracts:

| Contract | Purpose | LOC |
|---|---|---|
| `DelegateRegistry.sol` | Map service-id → trusted callee address (anti-spoof for the agent) | ~80 |
| `DelegateFacilitator.sol` | Verify x402 payment proofs, emit `Paid` / `AnomalyRefused` events for the UI | ~120 |

That's the entire onchain footprint we own. Everything else flows through the Delegation Framework + 1Shot.

---

## 10. UX Architecture (what the user actually sees)

| Step | Screen | Key element |
|---|---|---|
| 0 | First-run upgrade | "Activate DeleGate" big primary button. Etherscan link after upgrade. |
| 1 | Budget wizard | Weekly cap slider, expiry picker, per-call cap, callee list with toggles. |
| 2 | Service connect | Add Netflix-mock, Spotify-mock, etc. Each shown with status chip. |
| 3 | Dashboard | Live "Agent active" indicator, remaining budget gauge, next-invoice ETA, decision log feed. |
| 4 | Decision detail | Click any decision → see Venice prompt, structured output, tx link. |
| 5 | Anomaly alert | Red banner, "I refused $500 quote", one-tap "Approve override" or "Revoke service". |
| 6 | Friday Brief | Text + generated chart image + audio player. Downloadable. |
| 7 | Revoke | Big red button. Confirms with caveats. Onchain tx, Etherscan link. |

---

## 11. Go-to-market

- **Day-1 wedge:** crypto-native creators paying for $80-$200/mo of AI subs. Tweet a screen-cap of the Friday Brief.
- **Distribution flywheel:** Friday Brief audio clips get shared (they're short, narrated, and shareable). Each one watermarked "Compiled by DeleGate.AI".
- **Open the merchant SDK:** publish `@delegate/x402-merchant` so anyone can list their service in the registry. Lock-in for the next wave of x402 sellers.
- **Templates:** "Solo founder stack", "Crypto researcher stack", "Designer stack". One click, pre-configured callees.

---

## 12. Moat

- **Decision-log lock-in:** the longer the agent has run for a user, the better its anomaly baseline. Switching costs grow with usage.
- **Merchant registry:** as the canonical x402 service directory, we sit on the demand side of every new x402 merchant.
- **First credible consumer brand** in the agent-payments substrate.

---

## 13. Future expansion (the v2 vision)

DeleGate.AI is the **atomic unit**. The natural extensions:

- **Multi-agent**: per-domain agents (a "subs" agent, a "freelancer-payments" agent, a "treasury" agent), each with its own scoped delegation.
- **Redelegation to specialists**: the natural path to **BRIGADE** (see Appendix A). A subs agent that calls a research agent that calls a designer agent — all on the same payment substrate.
- **Onchain reputation**: every refusal and every successful payment is an attestation. Build a reputation graph for both agents and merchants.
- **Cross-chain**: the merchant lives on chain A, the budget lives on chain B; x402 routes the settlement.

---

## 14. Why this submission wins

| Reason | Evidence |
|---|---|
| Hits multiple tracks cleanly | Best Agent ✅ · Best x402 + ERC-7710 ✅ · Venice bonus ✅ · 1Shot bonus ✅ |
| Demoable in 3 minutes | Brief is one screen; anomaly catch is one click; Friday Brief plays inline. |
| Every primitive is load-bearing | The audit table in §7 shows zero decoration. |
| Live moments judges will remember | Anomaly refusal at 5 seconds; voice-narrated brief; one-tap revoke. |
| Honest scope, shippable in 7 days | Single-agent, single-user. No swarm, no video model. Risk profile suited to demo day. |

---

## 15. Build Strategy (realistic 7-day MVP)

### 15.1 Scope discipline

| Must ship (real, onchain) | Mockable for demo | Cut for MVP |
|---|---|---|
| 7702 upgrade via 1Shot | Service endpoints (Netflix-mock etc.) | Real Netflix/Spotify integration |
| 7715 advanced permission grant | Anomaly scenario trigger button | Reputation contracts |
| ERC-7710 redelegation per payment | Pricing history seed data | Multi-agent fanout |
| x402 payment flow with proof verification | | Cross-chain |
| Venice text / image / audio in main flow | | Mobile app |
| 1Shot webhooks → live UI | | Merchant onboarding portal |
| One-tap revoke (real onchain tx) | | Reputation attestations |
| Friday Brief (full multimodal) | | Templates marketplace |
| Anomaly catch with onchain event | | |
| Decision log with Venice prompt inspection | | |

### 15.2 Tech stack

- **Frontend:** Next.js 14, wagmi v2 + viem, Dynamic SDK (MetaMask Embedded Wallet signer), TailwindCSS, shadcn/ui, Framer Motion.
- **Backend:** Node 20, tRPC, zod, BullMQ for scheduled jobs, Postgres, Redis.
- **Onchain:** Sepolia for build; mainnet (or whichever chain 1Shot supports) for the recorded demo.
- **AI:** Venice OpenAI-compatible client for text + image + audio.
- **Infra:** single Railway project. No Kubernetes.

### 15.3 Timeline

| Day | Goal | Definition of done |
|---|---|---|
| 1 | Scaffolding: monorepo, Next.js shell, 1Shot SDK, Venice client, env wiring | "Hello Smart Account" works |
| 2 | 7702 upgrade flow end-to-end | First upgrade tx confirmed on Sepolia, visible in UI |
| 3 | 7715 grant + caveat builder + ERC-7710 redelegation per payment | First mock payment relayed via 1Shot |
| 4 | Merchant-mock services (5 endpoints), x402 facilitator middleware | `curl /quote` returns 402; `POST /charge` accepts proof |
| 5 | Daily reasoning loop + Venice text decisions + decision log | Cron tick processes due invoices, decisions persisted |
| 6 | Anomaly catch (rule engine + Venice refusal prompt) + onchain event | Demo button triggers $500 quote → live refusal in 5s |
| 7 | Friday Brief composer (text + image + audio); UI polish; one-tap revoke; receipt screen | Full demo loop runs cold start to cold start |
| 8 | Buffer day: edge cases, error toasts, retry logic, demo rehearsal | Cold demo works first try, twice in a row |
| 9 | Record demo video; write submission post; post 5 social updates tagging @MetaMaskDev | Submitted with 12h buffer |

### 15.4 What is real and what is staged

**Real on stage:**
- 7702 upgrade tx, observable on Etherscan
- 7715 grant with all caveats, inspectable
- Live anomaly refusal, with the Venice prompt + structured output shown
- Real x402 payment flow with redelegation
- Real one-tap revoke tx

**Disclosed-as-staged on stage:**
- Merchant services are mocks (no Netflix integration exists for x402). The mocks fully implement the x402 spec.
- The anomaly scenario is triggered by a demo button (so the reviewer can see it); the rule engine is real.

We tell the judge both of these. Honesty over theater.

---

## 16. Demo Script (2:45 hard ceiling)

> **[0:00 — 0:10] Cold open**
> *Camera on app. Empty dashboard.*
> "I'm going to give an AI agent $50 a week to manage my subscriptions. I'm also going to make it refuse to pay anything weird. Here's how."
>
> **[0:10 — 0:30] Setup**
> *Click "Activate DeleGate".*
> "DeleGate just upgraded my MetaMask wallet to a Smart Account with ERC-7702. I never touched ETH — 1Shot's relayer paid the gas in USDC."
> *Click Etherscan link on upgrade tx.*
> *Open budget wizard, set $50 cap, 7 days, 5 services.*
> "One 7715 prompt. Hard cap $50. Expires in 7 days. Per-call cap $30. Only these five services. I sign once."
>
> **[0:30 — 0:50] Daily flow**
> *Click "Run today's invoices".*
> "Watch the agent process today's invoices. Each one is an x402 quote. The agent reasons with Venice, checks pricing history, and either pays via redelegation or refuses."
> *Decision log fills in with green checkmarks and reasoning expandable.*
>
> **[0:50 — 1:20] Anomaly catch — the holy-shit moment**
> *Click "Inject anomaly".*
> "Now Netflix-mock just quoted me $500 instead of $15.99."
> *Five seconds. Red banner pops up:*
> "Refused. Reason: 32× the rolling median. The agent emitted an onchain `AnomalyRefused` event. Here it is on Etherscan."
> *Click into the event.*
>
> **[1:20 — 2:00] Friday Brief — Venice multimodal**
> *Click "Generate Friday Brief".*
> "Now the agent compiles my week. Three Venice endpoints in one report."
> *Text appears. Then a generated chart image. Then audio plays.*
> *Audio plays in real volume:* "This week, DeleGate paid $34.97 across four services and refused one $500 anomaly. I recommend cancelling Spotify-mock — zero usage in three weeks."
>
> **[2:00 — 2:30] Architecture slide**
> *Single slide: the §7 audit table.*
> "Every sponsor primitive does real work. Smart Account upgraded via 7702. Budget granted via 7715. Per-payment delegations via 7710. Payments are x402 with onchain proof. Three Venice endpoints in the main flow. Every transaction relayed by 1Shot in USDC. Webhooks drive the live UI."
>
> **[2:30 — 2:45] Mic drop**
> *Click big red Revoke button.*
> "And if I change my mind, one tap, one onchain tx, my agent's authority is dead. That's not an AI demo. That's what agentic finance was supposed to feel like."
>
> *End card: DeleGate.AI — bounded, revocable, multimodal.*

---

## 17. Judge-Level Critique (and the fixes already shipped)

### 17.1 Weaknesses & mitigations

| Weakness | Severity | Mitigation baked into the build |
|---|---|---|
| **"This is just a cron job with Venice on top"** | High | The decision log + Venice prompt inspector + anomaly refusal proves real reasoning. We *show* the Venice JSON output for every decision. |
| **All merchants are mocks** | High | Disclose upfront. Frame as "x402 is new — the substrate works; we ship a reference merchant SDK so any service can list." |
| **No A2A coordination** | Medium | We don't claim that track. We're optimizing for Best Agent + Venice + 1Shot. A2A is the BRIGADE v2 path. |
| **Anomaly trigger is a button** | Medium | Honestly disclose. The rule engine is real; the button just injects the quote. |
| **Venice image chart could look amateur** | Medium | Use a tuned art style (minimal, editorial) so it looks intentional, not glitchy. |
| **1Shot mainnet flakiness on demo day** | Medium | Sepolia fallback recorded; submission notes link both videos. |
| **7715 prompt UI lives in MetaMask extension — what if user is on Embedded Wallet?** | Medium | Embedded Wallet uses a programmatic equivalent. Dynamic SDK gives us both paths. |
| **Friday Brief audio TTS quality** | Low | Venice TTS is solid; we pre-pick the voice profile and confirm in rehearsal. |
| **"Not enough onchain depth"** | Medium | We surface the count: # of relayed txs, gas saved in USDC, # of redelegations issued, # of anomalies refused. Numbers on screen kill this critique. |
| **Scope feels small vs BRIGADE** | Low | Reframe as discipline: "We shipped the atom. BRIGADE is the molecule." See Appendix A. |

### 17.2 Why it can still lose, and what we'd do

- A team ships a polished BRIGADE-style swarm and it works. **Counter:** our cross-track coverage still earns Venice + 1Shot + maybe second on Best Agent. EV is positive.
- A team makes a viral consumer dApp that captures crypto twitter. **Counter:** post the Friday Brief audio with the watermark; create our own viral surface area.
- Judges fatigue on "subscriptions". **Counter:** lead with the anomaly refusal in the cold open, not subscriptions.

---

## 18. Track-by-Track Submission Checklist

**Best Agent** ($3K track)
- [ ] MetaMask Smart Accounts integrated in main flow
- [ ] Working integration shown in demo video
- [ ] 1Shot API usage shown in demo
- [ ] Real autonomous reasoning loop (not a cron with hardcoded if-else)

**Best x402 + ERC-7710** ($3K track)
- [ ] ERC-7710 delegations used for every payment
- [ ] x402 payment flow with proof verification end-to-end
- [ ] 1Shot relay shown in demo

**Best Use of Venice AI** ($3K bonus)
- [ ] Qualifies for a main track ✅ (Best Agent + Best x402)
- [ ] Venice as core part of the application
- [ ] Multiple Venice endpoints in main flow (text + image + audio)
- [ ] Meaningful AI-powered output (the Friday Brief + reasoning + refusals)

**Best Use of 1Shot Permissionless Relayer** ($1K bonus)
- [ ] 7710 transactions relayed through 1Shot mainnet relayer
- [ ] 7702 authorization to upgrade EOA → Smart Account via 1Shot
- [ ] Webhooks used as source of truth for UI state
- [ ] x402↔7710 facilitator module open-sourced

**Best Social Media Presence** ($100 ×5 bonus)
- [ ] 5+ posts tagging @MetaMaskDev with build journey
- [ ] Highlight how Advanced Permissions improved UX
- [ ] Friday Brief shared as audio post (organic viral surface)

**Best Feedback** ($100 ×5 bonus)
- [ ] Submit specific actionable feedback on docs/SDK/relayer DX after build

---

## 19. Repository layout

```
delegate-ai/
├── apps/
│   ├── web/                       # Next.js frontend
│   ├── agent/                     # Reasoning loop + Venice client + anomaly engine
│   └── merchants/                 # Mock x402 merchant services
├── packages/
│   ├── facilitator/               # x402 ↔ 7710 facilitator (reusable)
│   ├── caveats/                   # 7715/7710 caveat builders
│   ├── venice-client/             # typed wrapper (text · image · audio)
│   ├── oneshot-client/            # 1Shot relay + webhook helpers
│   └── ui/                        # shared React components
├── contracts/
│   ├── DelegateRegistry.sol
│   └── DelegateFacilitator.sol
├── spec/
│   └── x402-7710-facilitator.md   # the reference standard we publish
├── infra/
│   └── webhooks/                  # 1Shot webhook receiver
└── README.md
```

---

## 20. Why this submission wins (summary)

1. **Maximum risk-adjusted prize EV.** Four tracks targeted, all of them realistically reachable.
2. **Every sponsor primitive is load-bearing.** No decoration, no hand-waving. The audit table in §7 is the proof.
3. **Three demo-killer moments.** Multi-service agency, anomaly refusal, multimodal Friday Brief.
4. **Shippable in 7 days, real on demo day.** No swarm-UI gymnastics, no Venice video flakiness, no 3-hop redelegation Russian roulette.
5. **A consumer story judges actually feel.** Subscriptions + refusal + Friday Brief is something a non-crypto cousin would use.

---

# Appendix A — BRIGADE (the v2 vision, post-hackathon)

BRIGADE was the v1 finalist that lost the deliverability pass. It is preserved here because **DeleGate.AI's architecture is its atomic unit**: same caveats, same x402, same 1Shot, same Venice — just one agent instead of many.

### A.1 What BRIGADE is

A **Conductor agent** decomposes a creative brief, hires a **brigade of specialist sub-agents** (Scriptwriter, StoryboardArtist, Composer, VoiceActor, MotionAnimator, Editor) via **ERC-7710 redelegation**, and each sub-agent gets paid over **x402** for its piece. Final artifact (a music video, a podcast, a course module) is assembled and returned to the user. Unspent budget is auto-refunded by revocation.

### A.2 Why DeleGate.AI → BRIGADE is the natural path

| DeleGate.AI v1 | BRIGADE v2 |
|---|---|
| 1 user, 1 agent | 1 user, 1 Conductor, N specialists |
| 7715 grant + per-payment 7710 | 7715 grant + Conductor 7710 + specialist redelegations |
| Pays merchants over x402 | Specialists pay each other over x402 |
| Venice as decision brain | Venice as decision brain *and* production brain (image, music, video) |
| Single-flow demo | Swarm-graph demo |

Same primitives. Higher composition. Build v1 first, ship v2 once the substrate is proven.

### A.3 Why we didn't ship it now

- 6 specialists × specialist service + Conductor orchestration + swarm visualization frontend = 3-4× the surface area.
- Venice video is the slowest, flakiest Venice endpoint. Risk on stage too high.
- Multi-hop redelegation depth (3 hops) requires deep MetaMask Delegation Framework familiarity.
- A 7-day window with a small team forces a choice: ship one thing brilliantly, or ship three things shakily.

DeleGate.AI is the former. BRIGADE will follow once the atomic unit is shipping in users' hands.

---

<div align="center">

**DeleGate.AI** — bounded, revocable, multimodal.

*Built for the MetaMask Smart Accounts Kit × 1Shot API × Venice AI Dev Cook Off.*

</div>
