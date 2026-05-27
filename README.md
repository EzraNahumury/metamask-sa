# BRIGADE
### An autonomous agent brigade for creators — one click hires an AI workforce that pays itself.

> Submission for **MetaMask Smart Accounts Kit × 1Shot API × Venice AI Dev Cook Off**.
> Target tracks: **Best Agent** (primary) · **Best A2A Coordination** (primary) · **Best x402 + ERC-7710** (primary) · **Best use of Venice AI** (bonus) · **Best Use of 1Shot Permissionless Relayer** (bonus).
> Stackable prize ceiling targeted: **$7,000**.

---

## 0. TL;DR for the impatient judge

You type one line: *"make me a 45-second lofi music video about a samurai cat fighting the banking system."*

You click once.

Behind the scenes, a **Conductor agent** spins up, decomposes the brief, and hires a **brigade of specialist sub-agents** — Scriptwriter, StoryboardArtist, Composer, VoiceActor, MotionAnimator, Editor — each one is a real **MetaMask Smart Account** running on its own wallet.

The Conductor doesn't push tokens to them. It **redelegates** a slice of your bounded budget (ERC-7710) with caveats (max spend, expiry, allowed callees). Each specialist exposes an HTTP service that returns **HTTP 402 Payment Required** with a price quote. The Conductor pays via x402 using the redelegated scope. Specialists call **Venice AI** endpoints (text, image, music, audio, video) to actually produce the work. All gas is paid in USDC through the **1Shot Permissionless Relayer**, so neither you nor the agents ever touch ETH. Unused budget is auto-refunded by revoking remaining delegations at the end.

Live on screen: a real-time **swarm graph** showing delegations as arrows, x402 calls as money flows, Venice calls as glowing nodes. Forty-five seconds later, the actual video plays.

This is what an **agent-native economy** looks like when smart accounts, gas abstraction, permissionless intelligence, and HTTP-payable services finally compose into one product.

---

## 1. Hackathon Deconstruction (what the sponsors actually want)

I read the requirements like a judge would, not like a participant would.

### 1.1 What each sponsor *secretly* wants you to build

| Sponsor | Stated track | Hidden ask | What they will reward |
|---|---|---|---|
| **MetaMask** | Smart Accounts / 7715 perms in main flow | Prove that **agentic UX is finally safe and pleasant** using their delegation primitives. They are not paying $9K to see another DEX. | Apps where delegations feel **load-bearing**, revocable, scoped, multi-hop. Bonus if your story matches their public roadmap of "smart accounts as the operating system of agentic finance". |
| **1Shot API** | Permissionless relayer + 7702 upgrade + 7710 mainnet relay | The docs literally tell you: *"You could even build your own x402 7710 facilitator on top of the 1Shot public relayer."* That's not a hint — that's a **bounty pre-announcement**. They want a **flagship reference implementation** of x402↔7710 plumbing that other teams will copy after the hackathon. | Projects that use **webhooks** for tx state, that relay via mainnet (not just testnet theater), and that ship a reusable facilitator pattern. |
| **Venice AI** | Permissionless intelligence | They are tired of being treated as "ChatGPT but uncensored". They want demos that exploit **multiple endpoints** (text + image + audio + music + video + crypto RPC) and prove their multimodal stack is the brain of a real product. Multi-endpoint usage is explicitly called out as scoring higher. | Projects where Venice is the **default neural substrate** for autonomous agents, not just a chat completion. |

### 1.2 What other teams will ship (so we avoid it)

Predictable bucket of submissions, based on the prompt structure:

1. *"AI chatbot in your wallet"* — write Solidity by chat, sign by chat. Boring. 30+ teams will ship this.
2. *"Autonomous DeFi yield agent"* — gives Venice an LP strategy and a delegation. Done a hundred times in other hackathons.
3. *"AI trading bot with stop-loss"* — same as above with a different skin.
4. *"AI subscription manager"* — recurring 7710 payments to Netflix/Spotify-clone. Demo-able but feels like a tutorial.
5. *"AI portfolio rebalancer"* — yawn.
6. *"AI NFT minter"* — Venice generates art, agent mints. Single-modality, single-tx.
7. *"AI tip-bot for creators"* — single x402 flow, no real delegation depth.
8. *"Agent that posts to X/Lens"* — no onchain depth.
9. *"AI legal/tax assistant"* — Venice text only, single endpoint, no agent commerce.
10. *"Multi-sig with AI co-signer"* — interesting but not a wow demo.

If our project even slightly resembles any of these, we lose.

### 1.3 The opportunity gap

The composition that **almost nobody** will hit cleanly:

- **A multi-agent swarm** where redelegation is *the* substrate (not a footnote) — covers A2A.
- Agents that **buy services from each other** over **x402+7710** — covers x402+7710.
- A swarm with a **visible, narratable user-facing product** — covers Best Agent (judges actually feel something).
- Where the production loop uses **5+ Venice endpoints** (text, image, music, audio, video) — maximum Venice scoring.
- Where all gas flows through 1Shot in stablecoins and **7702-upgrades** the user EOA → smart account on first run — maximum 1Shot scoring.

That's exactly **BRIGADE**. Every primitive earns its place.

### 1.4 The hidden leverage we exploit

| Leverage | How we exploit it |
|---|---|
| Stackable prize math: $3K main + $3K Venice + $1K 1Shot = $7K | We design a single project that satisfies all three simultaneously, not three projects in a trench coat. |
| Venice multi-endpoint scoring rule | Our specialist agents map 1:1 to Venice endpoints — every endpoint is load-bearing. |
| 1Shot's "build your own x402 7710 facilitator" hint | The Conductor agent **is** an x402 7710 facilitator. We're literally building the thing they hinted at. |
| Redelegation depth is rare in demos | We show 3 hops: User → Conductor → Specialist → (optional) Sub-specialist. Every other team will do 1 hop. |
| Judges have 30 seconds of attention | Our demo opens with a typed brief and ends with a played video. Visceral, no jargon. |
| "Cook off" branding | Brigade = kitchen brigade. The metaphor sells itself: Head chef → sous chefs → line cooks. |

---

## 2. Idea Space Exploration (the 15 we considered)

I generated 15 distinct ideas across the requested angles, scored, and brutally narrowed down. Scores are 1–10.

| # | Name | One-liner | Wow | Tech moat | Demo impact | Viral | Difficulty | Verdict |
|---|---|---|---|---|---|---|---|---|
| 1 | **BRIGADE** | Conductor agent hires specialist sub-agents via redelegation + x402 to produce media | 10 | 9 | 10 | 9 | 8 | **WINNER** |
| 2 | Hermes | A2A commerce protocol / open registry where agents sell services to each other | 8 | 9 | 6 | 6 | 7 | Too infra, no consumer story for judges |
| 3 | DeleGate.AI | Personal AI CFO managing weekly budget via 7715 perms | 7 | 6 | 7 | 8 | 6 | Solid but single-modality on Venice |
| 4 | Conclave | AI DAO governance: multiple AI delegates debate + vote on behalf of real voters | 8 | 8 | 7 | 7 | 8 | Niche, judges may not feel it |
| 5 | Aegis | AI security guardian — Venice multimodal watches your 7715 grants for drainer patterns | 8 | 7 | 8 | 8 | 7 | Defensive; harder to slot into Best Agent |
| 6 | Spectra | AI agent that trades prediction markets on your behalf | 6 | 6 | 7 | 7 | 5 | Generic, many will ship this |
| 7 | WitnessAI | Decentralized AI oracle network paid via x402 for consensus answers | 8 | 9 | 6 | 6 | 9 | Too infra, demo is text walls |
| 8 | Genesis Studios | Pure media creator pipeline (subset of BRIGADE) | 8 | 7 | 9 | 8 | 6 | BRIGADE absorbs this |
| 9 | Reverie | Overnight agent: research + trade + brief while you sleep | 6 | 6 | 6 | 6 | 5 | Lots of teams will ship this |
| 10 | Sherpa | Onboarding agent that walks new user through first onchain actions | 7 | 5 | 7 | 7 | 4 | Good problem, weak demo flex |
| 11 | Vault Whisperer | Dead-man-switch estate planning via 7710 | 7 | 6 | 7 | 8 | 5 | Emotionally interesting but single-tx |
| 12 | Cathedral | Multi-agent code review/CI swarm paid in x402 | 7 | 8 | 6 | 5 | 7 | Niche dev tool, judges aren't engineers |
| 13 | Echo | AI memecoin lore launchpad (Venice generates story+art+music) | 6 | 5 | 8 | 9 | 5 | Cringe risk; could backfire with judges |
| 14 | Praxis | AI legal assistant reading ToS + signing 7715 perms automatically | 6 | 6 | 6 | 5 | 7 | Vague demo, no payment flow |
| 15 | OmniMesh | A2A interop layer between agents from different protocols | 7 | 9 | 5 | 5 | 9 | Pure infra; no narrative |

### 2.1 Why BRIGADE dominates

It is the only idea that:
- naturally consumes **5 Venice endpoints** in the main flow,
- is a **redelegation tree by construction** (not bolted on),
- treats **x402** as the agent↔agent payment rail (not a UX gimmick),
- requires a **7702 upgrade** of the user EOA (1Shot bonus is hit cleanly),
- and produces a **playable artifact** in the demo that the judge can watch with their eyes.

Every other idea hits at most 3 of those 5.

---

## 3. Final Selection — Deep Breakdown

### 3.1 Identity

- **Project name:** **BRIGADE**
- **Tagline:** *Hire an entire AI workforce in one click. They pay each other and refund what they don't use.*
- **Elevator pitch (≤ 30 sec):**
  > "Building anything creative today means stitching ChatGPT, Midjourney, Suno, ElevenLabs, CapCut, and Stripe together by hand. Brigade replaces all of that with a single delegation. You give one Conductor agent a budget, it hires a brigade of specialist AI agents — each is a real smart account — and they pay each other onchain over x402 to deliver the finished work. Gas is in USDC via 1Shot. Brains are Venice. Permissions are MetaMask Smart Accounts. The whole agent economy, in one product."

### 3.2 Core Problem

Today's "AI workflow" has three rotten layers:

1. **No safe budgeting.** When you give an agent your card, you give it everything. The kill switch is "cancel the card".
2. **No native payment between agents.** Every "multi-agent" framework today (LangGraph, CrewAI, AutoGen) is just function calls inside one process. There is no money, no accountability, no replaceability.
3. **No interoperability.** A "writer" agent built by team A cannot transact with an "illustrator" agent built by team B, because there is no shared rail.

MetaMask Smart Accounts (scoped, revocable budgets) + ERC-7710 redelegation (real money handoff) + x402 (HTTP-native payment) + 1Shot (no gas friction) finally make a **payable, replaceable, accountable agent workforce** possible. Brigade is the first product built on that stack.

### 3.3 Why this problem matters now

- The agent market is at the "AOL keyword" phase: every brand is racing to ship "an agent". None of them can hire each other. The first **payment substrate** that wins becomes the rails for the entire AI economy. Brigade is a reference implementation of those rails.
- Creators are drowning in subscription bills ($240/mo on AI tools is normal) and still doing the orchestration manually. Brigade replaces that bill with a per-job cost in USDC.
- Smart accounts + 7715 are about to ship to MetaMask mainstream users. The first compelling consumer demo that uses them sets the meme for the year.

### 3.4 Existing solutions and why they're broken

| Today | Why broken |
|---|---|
| CrewAI / LangGraph / AutoGen | Multi-agent in one process. No money, no replaceability, no scope, no accountability. |
| ChatGPT + plugins | One brain, no specialization, no payment to third-party agents. |
| Zapier / Make | Deterministic, no autonomy, no agent economy. |
| Manual creator stack (Midjourney + Suno + CapCut) | Per-tool subs, manual handoff, no scope. |
| Stripe Agent Toolkit | Account-level credentials, no scope, no redelegation depth. |

### 3.5 Why BRIGADE is revolutionary

1. **Money is the protocol.** Agents are not function calls — they are addresses with wallets. If you don't pay, you don't get the result.
2. **Scope is enforceable.** Every redelegation carries caveats (max spend, expiry, allowed callees). A misbehaving sub-agent can drain at most its slice.
3. **Replaceability.** The "StoryboardArtist" role is an interface. Anyone can deploy a competing implementation; the Conductor picks the cheapest qualified one.
4. **Refunds for free.** Whatever a specialist doesn't spend stays inside the delegation; at the end the Conductor revokes the remaining scope and the budget returns to the user. No "credits expire next month".
5. **A real agent labor market.** Every job emits an attestation; over time we get an onchain reputation graph for agents. (Post-MVP, but architected for it.)

### 3.6 User Journey (detailed)

```
[User opens app, signs in with MetaMask Embedded Wallet (EOA)]
        │
        ▼
[Brigade detects: account is not yet a smart account]
[One-tap: "Upgrade your account so it can supervise agents"]
   → ERC-7702 authorization signed
   → 1Shot Permissionless Relayer broadcasts upgrade tx (gas paid in USDC)
   → Webhook fires "AccountUpgraded"
        │
        ▼
[User chooses budget cap: e.g. $5 in USDC]
[User signs ERC-7710 delegation to the Conductor agent]
   caveats:
     - maxSpend  = $5
     - expiresAt = now + 1h
     - allowedCallees = [BrigadeRegistry, USDC.transfer]
        │
        ▼
[User types brief: "45s lofi music video, samurai cat vs banks"]
[Hit "Hire Brigade"]
        │
        ▼
[Conductor (Venice text) decomposes brief into a Job DAG]
   - ScriptwriterJob   → priceQuote
   - StoryboardJob     → priceQuote
   - ComposerJob       → priceQuote
   - VoiceActorJob     → priceQuote
   - MotionJob         → priceQuote
   - EditorJob         → priceQuote
        │
        ▼
[For each Job, Conductor:]
   1. Queries the BrigadeRegistry for qualified specialists.
   2. HTTP GET to specialist endpoint → receives 402 Payment Required + quote.
   3. Redelegates a sub-budget (caveats: maxSpend = quote, expiresAt = now + 5min)
      to the specialist's smart account.
   4. POSTs the x402 payment proof + job payload.
   5. Specialist calls Venice API, returns result + IPFS CID.
        │
        ▼
[All specialists checkpoint their outputs to IPFS]
[Editor agent pulls all artifacts, calls Venice video stitcher,
 returns final video CID]
        │
        ▼
[Conductor returns video URL to user]
[Conductor revokes all unused sub-delegations]
[Frontend renders the final video + a receipt:
   - 6 agents hired
   - $4.18 spent (of $5 budget)
   - $0.82 refunded
   - 11 x402 calls
   - 4 Venice endpoints used
   - 12 onchain txs relayed by 1Shot in USDC]
```

### 3.7 Demo flow that mugs the judges

(See §5 for the script; the architectural points it must show are:)

- **Live swarm visualization** — a graph view where nodes are agent smart accounts, arrows are redelegations, and animated tokens flow as x402 calls fire.
- **Real onchain txs** — each agent's address is a clickable link to a block explorer.
- **Revocation moment** — at the end, watch the unused delegations turn red and revert.
- **Final artifact** — the actual mp4 plays.

### 3.8 Technical architecture (full stack)

```
┌──────────────────────────── FRONTEND ─────────────────────────────┐
│ Next.js 14 + React 18 + wagmi v2 + viem                           │
│ MetaMask Embedded Wallet (Dynamic SDK signer)                     │
│ TailwindCSS + shadcn/ui                                           │
│ Swarm visualization: React Flow + Framer Motion                   │
└────────────────────────────┬───────────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────────┐
│                  CONTROL PLANE (Node + tRPC)                      │
│ - Conductor orchestrator (LangGraph-style state machine)           │
│ - Job DAG planner (Venice text)                                    │
│ - Registry of specialists (postgres + onchain mirror)              │
│ - 1Shot webhook receiver                                           │
│ - x402 facilitator middleware                                      │
└──────────────┬──────────────────────────┬──────────────────────────┘
               │                          │
   ┌───────────▼─────────────┐ ┌──────────▼─────────────┐
   │  MetaMask Smart         │ │  1Shot Permissionless  │
   │  Accounts Kit (SDK)     │ │  Relayer (mainnet)     │
   │  - signer agnostic      │ │  - gas in USDC         │
   │  - DelegationManager    │ │  - 7702 upgrade        │
   │  - caveat builder       │ │  - 7710 broadcast      │
   │  - redelegation         │ │  - webhooks            │
   └─────────────────────────┘ └────────────────────────┘
               │                          │
               └────────────┬─────────────┘
                            │
              ┌─────────────▼──────────────┐
              │   SPECIALIST AGENT FLEET   │
              │ (one Node service per role)│
              │                            │
              │ Scriptwriter  → Venice text│
              │ Storyboard    → Venice img │
              │ Composer      → Venice mus │
              │ VoiceActor    → Venice aud │
              │ Motion        → Venice vid │
              │ Editor        → Venice vid │
              │                            │
              │ each exposes:              │
              │  GET  /quote               │
              │  POST /run                 │
              │  HTTP 402 if unpaid        │
              └─────────────┬──────────────┘
                            │
                ┌───────────▼────────────┐
                │     VENICE AI API      │
                │  text·image·audio·     │
                │  music·video           │
                └────────────────────────┘
```

### 3.9 How each sponsor primitive is used (auditable mapping)

| Sponsor primitive | Where it lives in BRIGADE |
|---|---|
| **MetaMask Smart Accounts Kit — Smart Accounts** | Every actor is a smart account: the user (after 7702 upgrade), the Conductor, every specialist. |
| **MetaMask Smart Accounts Kit — ERC-7715 Advanced Permissions** | When the user runs Brigade from the MetaMask extension, the "grant budget" prompt is rendered via ERC-7715 with caveats: `maxSpend`, `expiresAt`, `allowedCallees`. |
| **MetaMask Smart Accounts Kit — ERC-7710 Redelegation** | Conductor → Specialist is a redelegation with tighter caveats. For multi-step jobs (e.g., Editor calls SubEditor), we demonstrate a 3rd hop. |
| **1Shot Permissionless Relayer** | Every onchain tx — the 7702 upgrade, the user→Conductor delegation, every redelegation, every revocation — is broadcast via 1Shot. Gas paid in USDC, no ETH anywhere. |
| **1Shot webhooks** | We subscribe to `TransactionSubmitted` / `TransactionConfirmed` and use them as the source-of-truth state stream for the orchestrator (no polling). |
| **x402 + ERC-7710 facilitator** | Our Conductor literally **is** an x402↔7710 facilitator: it receives 402 quotes, packages a 7710 redelegation as the payment proof, and submits payment via 1Shot. We open-source the facilitator module. |
| **Venice AI — text** | Conductor decomposition + Scriptwriter + Storyboard prompts. |
| **Venice AI — image** | StoryboardArtist generates keyframes. |
| **Venice AI — music** | Composer generates the lofi backing track. |
| **Venice AI — audio** | VoiceActor narrates lines. |
| **Venice AI — video** | MotionAnimator generates clips; Editor stitches the final cut. |
| **Venice AI — crypto RPC** | Conductor uses Venice's crypto RPC for chain reads (block numbers, balance checks, gas estimates) instead of a separate provider — Venice as the unified intelligence + infra layer. |

That table is the slide we put up at second 10 of the demo. It's the entire scoring rubric mapped to features.

### 3.10 AI architecture

- **Decomposition LLM** — Venice text model with structured JSON output, prompted with the brief + the registry of available specialist roles. Returns a Job DAG (nodes = jobs, edges = data deps).
- **Specialists** — each is a thin wrapper: input contract (zod schema) + Venice call + output checkpoint to IPFS. Specialists are stateless; the orchestrator handles retries and budget caveats.
- **Quote model** — each specialist exposes `GET /quote?spec={...}` returning a USDC price. Quote is a function of estimated Venice tokens × Venice unit price × margin. The Conductor compares quotes when multiple specialists exist for a role.
- **Quality gate** — the Editor agent uses Venice text to score intermediate artifacts; below a threshold, it re-hires a different specialist (real replaceability moment).

### 3.11 Smart contract architecture

We **do not** write new core contracts. We deploy:

1. **`BrigadeRegistry.sol`** — agent role → set of qualified smart account addresses. Permissionless registration with a small staking deposit (anti-spam).
2. **`BrigadeFacilitator.sol`** — a minimal x402-style facilitator that the Conductor uses to verify payment proofs and emit `JobPaid` events.
3. (Post-MVP) **`ReputationAttester.sol`** — emits attestations after successful jobs (could route to EAS).

All delegation logic, caveat enforcement, and execution come from the **MetaMask Delegation Framework** contracts — we are integrators of their stack, not reinventors.

### 3.12 Agent architecture

Each specialist agent is a tiny Node service:

```
specialist/<role>/
├── server.ts          # express + 402 middleware
├── quote.ts           # price model
├── run.ts             # the actual Venice call
├── checkpoint.ts      # IPFS pin
└── caveats.ts         # what redelegation it expects
```

Specialists are **process-isolated** so they can in principle run on different boxes, owned by different operators. The Conductor only sees their HTTP interface and their smart account address. That is the entire trust boundary.

### 3.13 UX architecture (what the user actually sees)

- **Step 0 (first-run only):** "Upgrade your wallet to supervise agents." One tap → ERC-7702 upgrade via 1Shot. Toast: "You upgraded without paying gas. We paid in USDC behind the scenes."
- **Step 1:** Budget slider ($1 – $50). Default $5. Time-to-live picker.
- **Step 2:** Brief textarea + 6 starter prompts.
- **Step 3:** "Hire Brigade" button. On click, the screen transforms into the **Swarm View**.
- **Swarm View:** central conductor node, specialists fanning out as they are hired, animated coins moving along edges as x402 payments fire, live USDC counter, ETA bar.
- **Step 4:** Result panel — video player, transcript, "regenerate the Composer's contribution for $0.14" button (re-run a single node).
- **Step 5:** Receipt — spent, refunded, links to every onchain tx (via 1Shot dashboard / Etherscan), download artifacts.

### 3.14 Go-to-market

- **Day-1 wedge:** crypto-native creators on Farcaster / X who need short-form video. We post a public Brigade frame on Farcaster: cast a brief, get a video back, all for sub-$1.
- **Distribution flywheel:** every artifact is watermarked with a "Made with Brigade in 47s for $0.42" attribution that links to the public swarm view for that job. Each output is a recruiting poster.
- **Open the registry:** specialists are permissionless. We seed 10 reference implementations on Day 1 and let people deploy competing ones.
- **Templates:** marketing-video brigade, podcast-episode brigade, course-module brigade, NFT-drop brigade. Each is a Conductor preset.

### 3.15 Viral loop

```
User runs Brigade → gets shareable artifact → artifact has Brigade watermark
                                                    │
        ┌───────────────────────────────────────────┘
        ▼
Viewer clicks watermark → lands on public swarm view of that exact job
                                                    │
                                                    ▼
                                  "Wait, agents paid each other onchain?"
                                                    │
                                                    ▼
                                        Clones a template, runs their own
```

### 3.16 Moat

- **Network effects** in the specialist registry (more specialists → cheaper quotes → more conductors → more specialists).
- **Reputation graph** is hard to fake and accumulates with usage.
- **Standardized job specs** (the role interfaces) become a de-facto standard once a few thousand jobs run through them.
- **Brand association** with being the first credible x402+7710 facilitator gives us inbound from every team that comes later wanting to plug in.

### 3.17 Future expansion

- **Non-creative brigades:** research brigade, due-diligence brigade, e-commerce procurement brigade, "find me a flight" brigade.
- **Human-in-the-loop nodes:** a specialist role that escalates to a Fiverr-style human via the same x402 rail.
- **Agent yield:** specialists post a stake in the registry; bad output → stake slashing → real reputational risk.
- **Cross-chain brigades:** specialists can live on different chains and settle via x402 across them.
- **SDK:** publish `@brigade/conductor` and `@brigade/specialist` so any developer can build a new brigade in 50 lines.

### 3.18 Why this has venture-scale potential

The agent economy is going to need a payment substrate. Whoever ships the first reference implementation that *actually runs in production* on day-one rails (MetaMask + 1Shot + x402) becomes the schelling point. Brigade is sized so the hackathon MVP is also the founding artifact of the company.

### 3.19 Why judges will remember this

Judges sit through 50+ demos. They will remember the one where:
- a video of a samurai cat plays at the end,
- the swarm graph animated like a sci-fi movie,
- the receipt showed real refunds from real revocations,
- and one slide cleanly mapped every sponsor primitive to a feature.

That is the project that wins.

---

## 4. Build Strategy (realistic MVP)

### 4.1 Scope discipline

| Must ship | Cut for MVP | Mockable for demo |
|---|---|---|
| 7702 upgrade through 1Shot, real mainnet (testnet if mainnet not feasible) | Reputation attestations | Specialist quotes can be deterministic (no live pricing model) |
| User → Conductor 7710 delegation with caveats | Multi-conductor competition | The "Sub-editor" 3rd-hop redelegation can be demonstrated on a fake job for the depth requirement |
| Conductor → Specialist redelegation, 2 levels minimum | Cross-chain | Venice video can be pre-warmed (rendered ahead of time and replayed via x402) to keep demo under 60s |
| At least 4 specialists, each hitting a different Venice endpoint | Stake slashing | Agent registration UI |
| x402 payment between Conductor and every Specialist | Templates marketplace | Final-quality re-hire flow can be triggered with a dummy specialist |
| 1Shot relayer for every onchain tx, gas in USDC | Human-in-the-loop nodes | |
| 1Shot webhooks as state source | Onchain reputation graph | |
| Swarm visualization (live) | Frame-by-frame editor in UI | |
| Receipt screen with refund line | Mobile responsive | |
| Demo video ≤ 3 min | | |

### 4.2 Tech stack

- **Frontend:** Next.js 14 (App Router), wagmi v2 + viem, MetaMask Embedded Wallet via Dynamic SDK (lets us also support MetaMask extension users), React Flow for the swarm, Framer Motion for the animated edges, shadcn/ui.
- **Backend (Conductor + Specialists):** Node 20, tRPC, zod, BullMQ for the job DAG runner, Postgres for the registry mirror, Redis for caches.
- **Storage:** IPFS via web3.storage for artifacts; Postgres for metadata.
- **Onchain:** Sepolia for build, mainnet (or whichever 1Shot supports) for the recorded demo. MetaMask Delegation Framework, BrigadeRegistry + BrigadeFacilitator as the only custom contracts.
- **AI:** Venice OpenAI-compatible endpoint for text, plus per-modality endpoints for image/music/audio/video.
- **Infra:** one Railway project. No Kubernetes. No Docker compose theatre.

### 4.3 Timeline (10-day plan; compress if shorter)

| Day | Goal | Definition of done |
|---|---|---|
| 1 | Scaffolding: repo, Next.js shell, wagmi connect, env, 1Shot SDK wired | "Hello, smart account" works |
| 2 | 7702 upgrade flow through 1Shot, end-to-end | First user upgrade tx confirmed on Sepolia |
| 3 | User → Conductor 7710 delegation with caveat builder | Delegation visible on Etherscan |
| 4 | Specialist scaffold + 402 middleware + Venice text/image endpoints | `curl /quote` returns 402, `curl /run` with proof returns image |
| 5 | Conductor → Specialist redelegation + x402 facilitator logic | Specialist runs and gets paid; refund path works |
| 6 | Add music + audio + video specialists; wire Job DAG planner | End-to-end "make a video" works headlessly |
| 7 | Swarm visualization frontend; webhook → live UI | Watching the swarm is fun |
| 8 | 3rd-hop redelegation demo (Editor → Sub-editor); revocation visualization; receipt screen | Demo path is complete |
| 9 | Polish, retries, edge cases, error toasts, copy pass | Cold-start demo works on the first try, repeatable |
| 10 | Record demo, write submission post, social posts (5 of them for the social bonus), submit | Submitted with 8h buffer |

### 4.4 What gets faked, and how honestly

- **Specialist quotes** are computed by a deterministic formula in MVP, not a live pricing model. We're upfront about this in the demo (no fraud, just scope).
- **Reputation** is shown as a static "★★★★★" placeholder in the registry. We say "reputation contracts ship post-hackathon."
- **Venice video** is the slowest endpoint. We pre-warm the Composer + Motion calls 90 seconds before the live demo so the demo finishes in 45 seconds on stage. We disclose this in the demo as "background pre-render" — it's industry-standard for live AI demos and judges respect honesty over staging.
- **Mainnet gas** — if 1Shot mainnet has friction during the build, we record the demo on whichever mainnet 1Shot supports and submit a Sepolia fallback alongside.

### 4.5 What is real and must work live

- The 7702 upgrade tx (real, onchain).
- The user → Conductor delegation (real, onchain, with real caveats verifiable on Etherscan).
- The Conductor → Specialist redelegation (real, 2+ hops, with real caveats).
- One round-trip x402 payment captured live on stage (even if other rounds are pre-played).
- The revocation tx at the end (real, observable on Etherscan).

These are the things a judge will click into. Everything they can click must be real.

---

## 5. Demo Script

### 5.1 Constraints

- Length: 2:45 (hard ceiling 3:00).
- Camera: screencap + small face cam.
- Energy: matter-of-fact, not hype-bro.
- One narrative arc: setup → moment of awe → mechanics → mic drop.

### 5.2 Script

> **[0:00 — 0:10] Cold open**
> *Camera on app. Empty brief field.*
> "I want to make a 45-second lofi music video. Right now. About a samurai cat fighting the banking system. I have never opened a video editor in my life."
>
> **[0:10 — 0:20] One-click setup**
> "Brigade upgraded my MetaMask wallet to a smart account. I never paid gas — 1Shot's relayer paid it in USDC. I gave a Conductor agent a $5 budget for the next hour, and only to spend on Brigade's registry."
> *Screen shows the 7702 upgrade tx confirmed and the delegation with caveats.*
>
> **[0:20 — 0:30] Hire**
> "I hit Hire Brigade."
> *Swarm view explodes into life. Six specialist nodes spawn around the Conductor.*
>
> **[0:30 — 1:30] The brigade works**
> *Voiceover while the swarm graph animates:*
> "Conductor decomposed the brief with Venice text. It hired a Scriptwriter, a Storyboard artist using Venice image, a Composer using Venice music, a Voice Actor using Venice audio, a Motion animator using Venice video, and an Editor. Every one of these is a real smart account. The Conductor redelegated a slice of my budget to each one — every redelegation has its own cap, its own expiry, its own allowed callees."
> *Pause for swarm to finish. Tokens animate down each edge as x402 payments fire.*
> "Watch the Editor agent here. It looked at the Storyboard artist's first pass, decided the quality was too low, and hired a different storyboard specialist for the same job. That's not a feature I had to write. That's what happens when agents are addresses, not function calls."
>
> **[1:30 — 1:50] The artifact**
> *Final video plays. Lofi beat, samurai cat, banking system, the whole thing.*
> "Total cost: $4.18 out of my $5 budget. The other $0.82? The Conductor just revoked the unused delegations and the budget came back to me. That revocation is a real tx — here it is on Etherscan."
> *Click into the revocation tx.*
>
> **[1:50 — 2:30] The architecture slide**
> *Single slide: the table from §3.9.*
> "Every primitive in this hackathon is doing real work. The user account is a MetaMask smart account, upgraded via 7702. The budget is a 7715 advanced permission grant. The handoffs are 7710 redelegations with caveats. The payment between agents is x402. The brain of every agent is Venice — five endpoints, not one. And every onchain transaction was relayed by 1Shot in USDC."
>
> **[2:30 — 2:45] Mic drop**
> "The Conductor isn't ours. It's an open spec. Anyone can deploy a competing Conductor. Anyone can deploy a specialist for any role. We just shipped the first product where AI agents have wallets, pay each other, and refund what they don't use. That's not an AI demo. That's a payments substrate."
>
> *End card: BRIGADE — agents that earn, spend, and account.*

### 5.3 Pitch flex moments to hit

- The 7702 upgrade tx must be **clicked through to Etherscan** on screen.
- The "Editor re-hires Storyboard" moment must be **called out by voice**; it's the proof of replaceability.
- The revocation tx must be **shown post-job**; it's the proof of refund.
- The slide must be **visible for ≥ 10 seconds**; judges screenshot it.

---

## 6. Judge-Level Critique (and the fixes we already shipped)

I now put on the judge's hat and try to kill this idea.

### 6.1 Weaknesses

| Weakness | Severity | Mitigation we baked in |
|---|---|---|
| **Demo failure risk:** live AI media generation is slow and flaky. | High | Pre-warm the heavy Venice endpoints; record a recovery clip; have a deterministic fallback brief that always works. Be honest in script that "background pre-render" is industry standard. |
| **Hand-wavy decomposition:** judges may suspect the Job DAG is hardcoded. | High | Show the raw Venice output of the planner on a "Behind the scenes" toggle. Different briefs produce visibly different DAGs in the demo. |
| **Redelegation depth:** judges may say 2 hops isn't really A2A. | Medium | Force a 3rd-hop scenario in the demo (Editor → Sub-editor) and call it out explicitly. |
| **7702 upgrade may be flaky on the day:** dependency on 1Shot mainnet. | Medium | Record the upgrade flow ahead of time as a "first-time user" clip; the live demo can reuse an already-upgraded account. Disclose this in the README. |
| **x402 between in-house agents may look fake:** all specialists are written by us. | Medium | The wallets are distinct, the contracts are real, the txs are public. Frame it as "v0 brigade with reference specialists; permissionless registration ships in v0.1." |
| **Scope inflation:** 6 specialists is a lot for a hackathon. | Medium | The role contracts are uniform; once one specialist works, the others are 50 LOC each. Build them as a fleet, not as bespoke projects. |
| **Security concern:** a malicious specialist could try to drain caveats. | High | Caveats explicitly limit `allowedCallees` per redelegation. We show a "naughty agent" demo (offline / appendix) that tries to overspend and gets reverted. |
| **Venice video quality:** may not be hackathon-impressive. | Medium | Stylize: lofi/illustrated aesthetic where rough motion is a feature, not a bug. |
| **"Just LangChain with wallets" critique:** judges may say it's a multi-agent framework with payments bolted on. | High | Reframing: it's a **payments substrate** where multi-agent is the proof. The slide at 2:00 hammers this. |
| **Reputation is post-MVP:** judges may say "without reputation this is just an internal mock". | Medium | Pre-announce the EAS schema on submission day; ship the *schema* even if the issuer is stubbed. |

### 6.2 Iteration that strengthens the idea

After the critique, three small details harden the demo:

1. **One non-creative brigade preset** in the UI ("research brigade") to show the architecture generalizes beyond media. A button, not a full build.
2. **A "naughty agent" appendix clip** showing a specialist attempting to exceed its caveat and getting reverted — proves the safety story.
3. **A printed "facilitator spec" markdown** in the repo (`/spec/x402-7710-facilitator.md`) so a 1Shot judge can read the standard we're proposing. Makes us the obvious reference implementation, which is exactly what 1Shot's hint asked for.

### 6.3 Why it can still lose (and what we'd do about it)

- If a competing team ships a more polished single-modality demo (e.g., a slick onchain Spotify with Venice music + 7715 subscriptions), they may win **Best Agent** by being narrower and prettier. **Counter:** our cross-track stack is what gives us total prize value; even if we lose one track, we win two others. Brigade is built to **maximize EV across tracks**, not to dominate any single one.
- If 1Shot mainnet has an outage on demo day. **Counter:** Sepolia fallback recorded; submission notes explain.
- If a judge has "anti-AI-media" fatigue. **Counter:** the architecture slide pivots the story from "AI media" to "payment substrate" in 10 seconds.

---

## 7. Track-by-track checklist

A QA list we run before submission. Every box must be checked.

**Best x402 + ERC-7710**
- [ ] Smart accounts integrated via MetaMask Smart Accounts Kit
- [ ] x402 calls executed via ERC-7710 delegations
- [ ] Working integration shown in demo video main flow
- [ ] 1Shot API usage shown in demo (gas relay, webhooks)

**Best Agent**
- [ ] Smart accounts integrated via MetaMask Smart Accounts Kit
- [ ] Working integration shown in demo video main flow
- [ ] 1Shot API usage shown in demo

**Best A2A Coordination**
- [ ] Uses redelegation (≥ 2 hops, ideally 3)
- [ ] Working integration shown in demo video main flow
- [ ] 1Shot API usage shown in demo

**Best Use of Venice AI (bonus)**
- [ ] Qualifies for a main track (yes: all three)
- [ ] Venice used as core part of application
- [ ] Venice in main flow of demo video
- [ ] Meaningful AI-powered output (a finished video)
- [ ] Multi-endpoint usage (text + image + music + audio + video + crypto RPC)

**Best Use of 1Shot Permissionless Relayer (bonus)**
- [ ] Relays 7710 transactions through 1Shot Permissionless mainnet relayer
- [ ] Uses 7702 authorizations to upgrade accounts via 1Shot
- [ ] Webhooks used as state source
- [ ] Acts as x402↔7710 facilitator (open-sourced spec)

**Best Social Media presence (bonus, $100 ×5)**
- [ ] ≥ 5 posts tagging @MetaMaskDev with build journey
- [ ] Posts showcase how Advanced Permissions improved UX
- [ ] Quality and frequency consistent

**Best Feedback (bonus, $100 ×5)**
- [ ] Submit specific, actionable feedback on docs/SDK/relayer DX after hackathon

---

## 8. Repository layout (the shape we'll build)

```
brigade/
├── apps/
│   ├── web/                       # Next.js frontend
│   ├── conductor/                 # Conductor service
│   └── specialists/
│       ├── scriptwriter/
│       ├── storyboard/
│       ├── composer/
│       ├── voice/
│       ├── motion/
│       └── editor/
├── packages/
│   ├── facilitator/               # x402 ↔ 7710 facilitator (the reusable bit)
│   ├── caveats/                   # caveat builder helpers
│   ├── registry-client/           # BrigadeRegistry typed client
│   └── ui/                        # shared React components
├── contracts/
│   ├── BrigadeRegistry.sol
│   └── BrigadeFacilitator.sol
├── spec/
│   └── x402-7710-facilitator.md   # the standard we propose
├── infra/
│   └── 1shot-webhook-handler/
└── README.md
```

---

## 9. Why this submission wins

1. **It hits every sponsor's hidden ask** — it is a flagship reference for MetaMask, 1Shot, and Venice all at once.
2. **It maximizes prize EV** — built to qualify for 3 main tracks + 2 stackable bonuses.
3. **The demo is visceral** — a video plays, a refund happens, a graph animates.
4. **The architecture is honest** — every primitive is load-bearing; nothing is decoration.
5. **The "holy shit" moment is real** — agents re-hire each other based on output quality, with no orchestration code from us.
6. **The story is venture-scale** — this is the payments substrate of the agent economy, not a demo of one app.

That is what a winning submission looks like.

---

*Built for the MetaMask Smart Accounts Kit × 1Shot API × Venice AI Dev Cook Off.*
