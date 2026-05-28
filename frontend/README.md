# DeleGate.AI — Frontend

The Next.js 16 dashboard for [DeleGate.AI](../README.md). Connects to the
`@delegate/agent` HTTP server, subscribes to its Server-Sent Events stream,
and drives the user-facing ERC-7715 grant flow through MetaMask.

---

## 1. Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Runtime | React 19 |
| Styling | Tailwind 4 (CSS-first, no config file) |
| Motion | Framer Motion 11 |
| Icons | lucide-react |
| Web3 | viem 2.31.4 (pinned to match `@metamask/smart-accounts-kit` peer dep) |
| Wallet | EIP-6963 multi-wallet discovery — `@metamask/smart-accounts-kit/actions` for the 7715 grant |
| Utilities | clsx + tailwind-merge |

No global state library, no chart library, no toast library — every helper
component is local and small.

---

## 2. Run alongside the rest of the stack

The dashboard depends on the agent (`:4030`) and the merchants service
(`:4021`) being up. From the repo root:

```bash
# Terminal 1
pnpm --filter @delegate/merchants run start

# Terminal 2
pnpm --filter @delegate/agent run start

# Terminal 3
pnpm --filter frontend run dev
```

Open <http://localhost:3000>. The agent status pill in the top-right
goes green once the bootstrap `GET /decisions` succeeds.

To run the frontend on its own (against a remote agent/merchants), set
the environment variables in §3.

---

## 3. Environment variables

All are optional — sensible localhost defaults ship in code.

| Var | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_AGENT_URL` | `http://localhost:4030` | Reasoning agent's HTTP/SSE base URL. |
| `NEXT_PUBLIC_MERCHANTS_URL` | `http://localhost:4021` | Mock merchants base URL (used by the catalog + anomaly trigger). |
| `NEXT_PUBLIC_SESSION_ACCOUNT` | hardcoded burner | Session signer address baked into every ERC-7715 grant. Override per deployment. |

Put overrides in `frontend/.env.local`.

---

## 4. Folder layout

```
frontend/app/
├── components/
│   ├── Dashboard.tsx           Top-level orchestrator: SSE wiring,
│   │                           keyboard shortcuts, layout shell.
│   ├── Hero.tsx                Editorial hero — live burner USDC
│   │                           balance, Venice credit, recent
│   │                           activity micro-feed.
│   ├── OnboardingPanel.tsx     Step 01 — wallet picker, cap chips,
│   │                           ERC-7715 grant flow.
│   ├── WalletPicker.tsx        EIP-6963 modal — lists every detected
│   │                           wallet, MetaMask tagged "recommended".
│   ├── ServiceHealth.tsx       Step 02 — per-merchant status card
│   │                           with 5-cell history strip.
│   ├── FridayBrief.tsx         Step 04 — Venice text/image/audio
│   │                           digest panel.
│   ├── DecisionRow.tsx         Decision feed row, click to expand
│   │                           the Venice prompt + raw response.
│   ├── DecisionFilters.tsx     All / Paid / Refused / Onchain chips.
│   └── ui/
│       ├── Paper.tsx           Default surface card.
│       ├── Btn.tsx             Tactile button (4 variants + loading).
│       ├── Logo.tsx            Brand mark with halo, used in nav + hero.
│       ├── Marquee.tsx         Looping system-status ticker.
│       ├── StatusDot.tsx       Connection indicator with pulse halo.
│       ├── AnimatedNumber.tsx  Spring-tweened count-up.
│       ├── Sparkline.tsx       SVG sparkline, no chart lib.
│       ├── Kbd.tsx             Keyboard-shortcut chip.
│       ├── Copyable.tsx        Inline copy-to-clipboard with confirm.
│       └── Toaster.tsx         Bottom-right notification rail.
├── lib/
│   ├── agent-client.ts         fetch + EventSource helpers (decisions,
│   │                           services, triggerTick, armAnomaly,
│   │                           subscribeAgentEvents).
│   ├── friday-brief.ts         Wrapper around GET /friday-brief.
│   ├── types.ts                Mirrors agent Decision + AgentEvent.
│   ├── format.ts               formatMicroUsdc / formatTime / shortAddr.
│   ├── utils.ts                cn(), formatError() (no more
│   │                           [object Object]).
│   ├── web3.ts                 Plain Base chain via defineChain,
│   │                           connectWithProvider, ensureBaseChain.
│   ├── wallet-discovery.ts     useDiscoveredWallets() — EIP-6963 hook.
│   ├── permission-store.ts     localStorage for the 7715 grant blob.
│   ├── useBaseBalance.ts       useBaseUsdcBalance(address) — public
│   │                           client read against USDC contract.
│   ├── useCountdown.ts         Next-tick countdown timer.
│   └── useToasts.ts            Tiny pub/sub toast store.
├── page.tsx                    Mounts <Dashboard /> + <Toaster />.
├── layout.tsx                  Root layout, favicon, fonts.
└── globals.css                 Token palette + paper/btn/aurora utilities.
```

---

## 5. Live data flow

1. On mount, `Dashboard` calls `GET /decisions` and `GET /` on merchants
   to seed state and flip the connection indicator to **live**.
2. It then opens `EventSource(GET /events)` on the agent and routes each
   typed event:
   - `decision.recorded` → upsert + highlight pulse + toast.
   - `payment.succeeded` → attach `receiptId` to the matching decision.
   - `payment.settled` → attach `txHash` + toast with the basescan link.
   - `tick.finished` → reset the next-tick countdown.
3. The hero independently reads the burner USDC balance via the shared
   public client (`useBaseUsdcBalance`).

The SSE stream is the source of truth for everything visible in the
decision feed and the stat cards.

---

## 6. ERC-7715 grant flow

Clicking **Sign ERC-7715 grant** in section 01 runs:

1. `WalletPicker` opens with every EIP-6963-announced wallet.
2. User picks one (MetaMask if installed).
3. `connectWithProvider(provider)` requests accounts, ensures Base, and
   returns a viem walletClient.
4. The walletClient is extended with `erc7715ProviderActions()` from
   `@metamask/smart-accounts-kit/actions`.
5. `requestExecutionPermissions([…])` opens the MetaMask popup with:
   - `chainId: 8453`
   - `permission.type: "erc20-token-periodic"`
   - `tokenAddress: USDC_BASE`
   - `periodAmount: parseUnits(budget, 6)` (bigint)
   - `periodDuration: 604800`
   - `isAdjustmentAllowed: true`
6. The kit returns the granted permission; the frontend persists the
   blob to `localStorage` via `permission-store.ts`. Section 01 flips to
   the caveat-summary view.

The agent runtime currently uses the same burner key as a stand-in for
the granted session account; rewiring the agent to redeem against the
real grant context is the next milestone (see roadmap in the root README).

---

## 7. Keyboard shortcuts

| Key | Action |
|---|---|
| `G` | Scroll to **01 Activate**. |
| `T` | Run a tick immediately (POST `/admin/run-tick`). |
| `F` | Scroll to **04 Friday Brief**. |

Form fields and modifier-key combos are ignored so the shortcuts never
fire while typing.

---

## 8. Build

```bash
pnpm --filter frontend run build
```

The page is a single static route (`/`); SSR is not used because the
data lifecycle is entirely client-driven. The build emits a single
prerendered `/` and `_not-found`.

---

## 9. What this dashboard is **not**

- Not a wallet of its own — it does not custody keys or sign on the
  user's behalf. Every signature is mediated by the EIP-6963 provider
  the user picked.
- Not a backend — every authoritative number (decisions, receipts, tx
  hashes) comes from `apps/agent`. The frontend renders, filters, and
  visualises; it doesn't invent state.
- Not a generic Next.js template anymore — the original
  `create-next-app` page was replaced wholesale. If you need the
  upstream template's README, regenerate with `pnpm create next-app`.
