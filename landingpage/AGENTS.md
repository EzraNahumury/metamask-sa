# landingpage — agent notes

Marketing landing page for **DeleGate.AI**. **Standalone Vite app** (not part of
the pnpm workspace, not Next.js). Managed with its own npm lockfile.

## Stack
- **Vite 6** + **React 19** + **TypeScript 5.8**
- **Tailwind CSS v4** via `@tailwindcss/vite` (config lives in `src/index.css`
  using `@theme` / `@layer` — there is no `tailwind.config.js`)
- **Motion** (`motion/react`, the Framer Motion successor) for animation
- **lucide-react** for icons

## Layout
- `index.html` — Vite entry (title/meta)
- `src/main.tsx` — React root
- `src/App.tsx` — the entire page plus helpers: `SandTransitionImage`
  (SVG-filter dissolve), `NetworkBackdrop` (canvas particle mesh), `SlideNumber`,
  and `Wordmark` (animated `DELEGATE.AI`)
- `src/index.css` — Google Fonts (Inter + JetBrains Mono), Tailwind import,
  `@theme` tokens, global base styles
- `public/assets/*.svg` — self-hosted monochrome web3 illustrations

## Conventions
- Fonts: Inter (sans), JetBrains Mono (mono labels)
- Palette: `#fcfcfc` off-white bg, `#111` / `#1a1a1a` near-black, `#0a0a0a` dark
  section. Strictly monochrome — no color accents.
- Illustrations are light-on-transparent so they read on the dark section and
  compose with `mix-blend-lighten`.
- Content mirrors the DeleGate.AI product: ERC-7715 grant → agent reasoning →
  x402 payment → ERC-7710/1Shot settlement on Base → multimodal Friday Brief.

## Commands
```bash
npm install
npm run dev      # vite dev server
npm run build    # tsc + vite build
npm run preview  # preview the production build
```
