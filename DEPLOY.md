# Deploy DeleGate.AI

Three services to put online:

| Service | Target | Reason |
|---|---|---|
| `frontend/` | Vercel | Next.js 16 native target. SSE consumer only. |
| `apps/agent` | Railway | Long-lived Node process, SSE producer, background tick loop. |
| `apps/merchants` | Railway | Long-lived Express server. |

Vercel's serverless model doesn't fit the agent's persistent SSE + cron-tick
shape — Railway (or Render/Fly) handles that cleanly. Frontend stays on
Vercel.

---

## 1. Deploy merchants

1. Push to GitHub if you haven't already.
2. Railway → New Project → Deploy from GitHub Repo → pick the repo.
3. Create service "delegate-merchants":
   - **Root Directory**: leave as `/` (Dockerfile copies what it needs).
   - **Builder**: Dockerfile.
   - **Dockerfile Path**: `apps/merchants/Dockerfile`.
4. **Variables tab** — paste from
   [`apps/merchants/.env.railway.example`](./apps/merchants/.env.railway.example).
5. **Settings → Networking** — generate public domain. Note the URL
   (e.g. `https://delegate-merchants.up.railway.app`).

Health-check: `GET /` should return the service JSON.

---

## 2. Deploy agent

1. Same Railway project. Add second service "delegate-agent":
   - **Root Directory**: `/`.
   - **Builder**: Dockerfile.
   - **Dockerfile Path**: `apps/agent/Dockerfile`.
2. **Variables tab** — paste from
   [`apps/agent/.env.railway.example`](./apps/agent/.env.railway.example).
   Set:
   - `SPIKE_PRIVATE_KEY` to the burner private key (the demo burner is
     funded with ~$1.90 USDC on Base; replace before scaling).
   - `MERCHANTS_BASE_URL` to the merchants URL from step 1.
   - `AGENT_CORS_ORIGIN` to the Vercel URL you'll get in step 3.
     (You can set this to `*` for now and tighten it after step 3.)
3. **Settings → Networking** — generate public domain. Note the URL
   (e.g. `https://delegate-agent.up.railway.app`).

Health-check: `GET /` returns
`{"service":"delegate-agent","merchantsBaseUrl":"…","tickIntervalSeconds":30}`.

---

## 3. Deploy frontend

1. [Vercel](https://vercel.com) → New Project → import the repo.
2. Settings:
   - **Framework Preset**: Next.js.
   - **Root Directory**: `frontend`.
   - **Build Command**: `pnpm install --frozen-lockfile && pnpm build`
     (Vercel detects pnpm via lockfile; this is the explicit form).
3. **Environment Variables**:

   ```env
   NEXT_PUBLIC_AGENT_URL=https://delegate-agent.up.railway.app
   NEXT_PUBLIC_MERCHANTS_URL=https://delegate-merchants.up.railway.app
   NEXT_PUBLIC_SESSION_ACCOUNT=0x5Aea061d814A72de9EE9171bE86F45f48e1E2f5d
   ```

4. Deploy. Note the public URL.
5. Go back to Railway → delegate-agent → Variables → set
   `AGENT_CORS_ORIGIN` to the Vercel URL (no trailing slash), redeploy.

---

## 4. Verify the full path

| Probe | Expected |
|---|---|
| `GET <vercel>/` | Dashboard HTML, status pill goes green |
| `GET <agent>/decisions` | `[]` initially, JSON array |
| `GET <agent>/events` | `text/event-stream` headers |
| `GET <merchants>/` | catalog JSON |
| `GET <merchants>/netflix-mock/quote` | HTTP 402 + x402 v2 accepts payload |
| Open dashboard, hit `T` | Tick runs, decisions stream over SSE, toasts fire |

If decisions show but receipts/tx hashes don't, double-check
`ONCHAIN_SETTLEMENT_MODE=dust` on the agent and that the burner has both
USDC on Base and Venice x402 credit.

---

## 5. Cost-control reminders

- **`ONCHAIN_SETTLEMENT_MODE=off`** during cold deploys + smoke tests so
  the background tick doesn't burn USDC while you debug. Flip to `dust`
  before recording the demo.
- The agent ticks every 30 s by default. Bump `AGENT_TICK_SECONDS` to
  `600` or higher between live demos to spare the Venice credit and
  USDC budget.
- Venice x402 credit and Base USDC are independent. Top up the lower one.
