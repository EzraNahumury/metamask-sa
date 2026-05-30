# DeleGate.AI — Landing Page

Marketing landing page for **DeleGate.AI** — *your AI chief of staff for onchain
money: bounded, revocable, multimodal*. An autonomous agent manages your
subscriptions inside a weekly USDC budget it can never overspend, scoped by a
MetaMask **ERC-7715** permission and settled onchain on **Base**.

Built with **Vite + React 19 + Tailwind CSS v4 + Motion + lucide-react**.
Monochrome editorial aesthetic, animated `DELEGATE.AI` wordmark, an ambient
onchain-network backdrop, and a sand/particle dissolve that walks through the
agent's five-step spend loop.

## Getting started

```bash
npm install
npm run dev
```

Open the URL Vite prints (default http://localhost:5173).

## Scripts

| Script            | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite dev server            |
| `npm run build`   | Type-check (`tsc`) then build (Vite) |
| `npm run preview` | Preview the production build         |

## Structure

- `src/App.tsx` — the whole page: Hero (animated wordmark + network backdrop),
  "How It Works", and the dark "Delegation" section, plus the
  `SandTransitionImage` (SVG-filter dissolve), `NetworkBackdrop` (canvas mesh),
  `SlideNumber`, and `Wordmark` helpers.
- `src/index.css` — fonts, Tailwind v4 `@theme` tokens, and global styles.
- `public/assets/*.svg` — self-hosted web3 illustrations (grant, reason, pay,
  settle, brief) plus the `specimen` network showpiece.

## The five steps (section 3)

1. **Grant a Budget** — sign an ERC-7715 advanced permission (weekly cap, expiry,
   allow-list) in a MetaMask Smart Account.
2. **The Agent Reasons** — Venice AI scores each 402 quote → PAY / REFUSE / ESCALATE.
3. **Pay via x402** — sign an EIP-3009 USDC transfer against an HTTP 402 quote.
4. **Settle Onchain** — redeem via ERC-7710, broadcast by the 1Shot relayer on Base.
5. **The Friday Brief** — a weekly multimodal digest: text, spend chart, and voice.

## Design system

- **Fonts:** Inter (sans), JetBrains Mono (mono labels).
- **Palette:** `#fcfcfc` (bg), `#111` / `#1a1a1a` (near-black), `#0a0a0a` (dark
  section). Strictly black / white / gray — no color accents.
- **Motion:** entrance staggers, `whileInView` reveals, and a cubic-bezier
  `[0.16, 1, 0.3, 1]` easing throughout.

> This page is presentational only — it does not yet wire to the agent/merchant
> services in the monorepo.
