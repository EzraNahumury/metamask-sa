# Day-0 Spike Log

> **Purpose.** Before we spend a week building DeleGate.AI, prove the four
> foundation primitives work end-to-end. Whatever doesn't work, capture the
> error and the workaround here so Day 1 starts from solid ground.

## Headline findings (Day-0)

| # | Finding | Action |
|---|---|---|
| 1 | **1Shot relayer is mainnet-only.** Sepolia + all Sepolia variants return empty capabilities. | Switched chain of record to **Celo mainnet (42220)** — cheapest gas, native USDC. |
| 2 | **MetaMask Smart Accounts Kit 1.5.0 pins `viem ^2.31.4`.** Installing newer viem causes deep `Two different types with this name` errors. | Pinned `viem 2.31.4` via pnpm override in root `package.json`. |
| 3 | **viem's `celo` chain export carries legacy Celo L1 block formatters.** They diverge from the generic `Chain` the kit expects. | Use `defineChain` to declare a plain Celo (post-L2) chain inside the spike scripts. |
| 4 | 1Shot `relayer_getCapabilities` on Celo confirms `targetAddress=0xd8C1F1BbF62caE442075Fba4AF546b247A3ac428`, tokens=`USDC` (`0xceba9300f2b948710d2653dd7b07f33a8b32118c`) + `USDT`. | Use Celo USDC as `ONESHOT_FEE_TOKEN`. |
| 5 | 1Shot `relayer_getFeeData` on Celo returns a real quote with `minFee=0.01 USDC` and a short-lived `expiresAt`. | Plan to re-quote per payment; cache only inside a single tx submission. |

---

## How to run

```bash
# 1. Install everything (root)
pnpm install

# 2. Copy env and fill in real values
cp .env.example .env
#    Required to fill in:
#       VENICE_API_KEY        → https://venice.ai/  (API settings)
#       SPIKE_PRIVATE_KEY     → throwaway burner key (never reuse personally)
#    Fund the burner with:
#       Sepolia ETH           → https://sepoliafaucet.com
#       Sepolia USDC          → https://faucet.circle.com

# 3. Run the spikes one at a time
pnpm spike:venice     # Venice text + image + audio smoke test
pnpm spike:1shot      # 1Shot relayer JSON-RPC reachability
pnpm spike:7702       # End-to-end 7702 upgrade via 1Shot
pnpm spike:7715       # 7715 grant payload shape validation
pnpm spike:webhook    # Boot webhook receiver, then ngrok http 8787

# Or run all of the read-only ones at once:
pnpm spike:all
```

---

## Results log

> Fill these in as each spike completes. Capture the exact request, response,
> and any workaround so Day 1 inherits a fully de-risked baseline.

### ☐ Spike 01 — Venice AI

| Endpoint | Status | Notes |
|---|---|---|
| `POST /chat/completions`   | _pending_ | model in use: `VENICE_TEXT_MODEL=…` |
| `POST /image/generations`  | _pending_ | model in use: `VENICE_IMAGE_MODEL=…` |
| `POST /audio/speech`       | _pending_ | voice in use: `VENICE_AUDIO_VOICE=…` |

**Findings.**
- _todo_

**Action items if any fail.**
- Text fails → swap to OpenAI-compatible fallback only as a last resort; we lose Venice scoring.
- Image fails → degrade Friday Brief to a charted text block.
- Audio fails → use browser SpeechSynthesis as fallback, demo only.

---

### ✅ Spike 02 — 1Shot Permissionless Relayer reachability

| RPC method | Status | Notes |
|---|---|---|
| `relayer_getCapabilities` | ✅ live | `42220` (Celo mainnet) |
| `relayer_getFeeData`      | _pending after first run on Celo_ | feeToken: Celo USDC |

**Findings (Day-0, captured live).**

1. **1Shot relayer is MAINNET-ONLY.** Every testnet we probed (Sepolia,
   Base Sepolia, Arbitrum Sepolia, Optimism Sepolia, Polygon Amoy, Celo
   Alfajores) returned an empty `{}` capability set or
   `Chain X is not supported`.

2. **Confirmed supported mainnets and a representative fee token each:**

   | chainId | chain            | feeCollector                                 | sample feeToken                                |
   |---------|------------------|----------------------------------------------|------------------------------------------------|
   | 1       | Ethereum         | `0xE936e8FAf4A5655469182A49a505055B71C17604` | USDC                                           |
   | 10      | Optimism         | same                                         | USDC                                           |
   | 56      | BNB Chain        | same                                         | USDC                                           |
   | 137     | Polygon          | same                                         | USDC                                           |
   | 8453    | Base             | same                                         | USDC `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
   | 42161   | Arbitrum One     | same                                         | USDC                                           |
   | **42220** | **Celo mainnet** | same                                       | **USDC `0xceba9300f2b948710d2653dd7b07f33a8b32118c`** + USDT `0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e` |

3. **`targetAddress`** (per chain — the relayer's executor contract) is
   logged in `spike/output/probes` after running `probe-chains.ts`. The
   Celo one we'll use is `0xd8C1F1BbF62caE442075Fba4AF546b247A3ac428`.

**Decision.**
- **Chain of record: Celo mainnet (42220).** Cheapest gas, native USDC,
  hackathon-friendly reputation, and all the primitives we need are
  supported. Funding cost for full Day-0 → demo cycle is expected to be
  well under $10 in USDC.
- **Fee token: Celo USDC** `0xceba9300f2b948710d2653dd7b07f33a8b32118c`.

**Risks introduced by being mainnet-only.**
- Each spike call costs real money. Mitigation: spike 02/04/05 are read-only
  / off-chain; only spike 03 and the future agent loop actually broadcast.
- Burner key safety is critical. Mitigation: a brand-new key generated
  *only* for this project, funded with <$10. Never reused.

---

### ☐ Spike 03 — ERC-7702 upgrade via 1Shot

**Steps verified.**
- [ ] EOA address derived from `SPIKE_PRIVATE_KEY` is funded on **Celo mainnet** (~$5 USDC + dust CELO)
- [ ] `toMetaMaskSmartAccount({ implementation: Stateless7702 })` returns a typed account
- [ ] Authorization signed with `account.signAuthorization` (chainId 42220)
- [ ] 1Shot `relayer_send7710Transaction` accepted the payload + authorizationList
- [ ] `relayer_getStatus` reached `CONFIRMED`
- [ ] `eth_getCode` on the EOA now returns non-empty code (delegator installed)
- [ ] tx is visible at https://celoscan.io/address/&lt;EOA&gt;

**Open questions raised by docs (resolve before Day 1).**
- The exact stateless 7702 delegator address on Celo mainnet. If the kit
  doesn't export it cleanly, pin a known value in `.env` and document it
  here once the spike runs green.
- The exact relayer param shape for bundling `authorizationList` with a no-op
  execution. Capture the working request below.

```jsonc
// PASTE the exact working relayer_send7710Transaction request here once green:
{
  "method": "relayer_send7710Transaction",
  "params": {
    "chainId": "...",
    "feeToken": "...",
    "authorizationList": [/* 7702 auth tuple */],
    "execution": { "target": "0x…", "value": "0x0", "data": "0x" }
  }
}
```

**Findings.**
- _todo_

---

### ☐ Spike 04 — ERC-7715 grant shape

**Steps verified.**
- [ ] `@metamask/smart-accounts-kit/actions` exports `erc7715ProviderActions`
- [ ] `walletClient.requestExecutionPermissions` exists on the extended client
- [ ] The `erc20-token-periodic` permission payload type-checks
- [ ] (Browser leg — checked manually later) MetaMask extension renders the prompt

**Findings.**
- _todo_

**Decisions.**
- Caveat set we ship in v1:
  - `maxSpend = 50 USDC / week` (slider in UI, $50 is default)
  - `expiresAt = now + 7d`
  - `allowedCallees = [registered service addresses]`
  - `perCallCap = 30 USDC`
- If `allowedCallees` is not a first-class caveat in `erc20-token-periodic`,
  add a custom caveat enforcer in `DelegateFacilitator.sol` and reference
  it via the delegation framework's `caveats` array. Document the chosen
  approach here.

---

### ☐ Spike 05 — webhook receiver

**Steps verified.**
- [ ] Express server boots on `WEBHOOK_PORT`
- [ ] Self-ping `/health` returns 200
- [ ] `ngrok http <WEBHOOK_PORT>` exposes a public https URL
- [ ] Public URL pasted into `.env` and rerunning the spike POSTs a
      synthetic webhook to it, server logs the payload

**Findings.**
- _todo_

**Decisions.**
- Webhook handler responsibilities (Day 4+):
  - Persist `TransactionSubmitted` → set invoice row to `relaying`.
  - On `TransactionConfirmed` → flip to `paid` + emit SSE event to the frontend.
  - On `TransactionFailed` → flip to `failed`, raise to user.

---

## Foundation go/no-go

DeleGate.AI Day-1 can only start when:

- [ ] All three Venice endpoints return real content.
- [ ] 1Shot capabilities + fee data come back for our chosen chain + token.
- [ ] A real 7702 upgrade tx confirms onchain and the EOA shows code.
- [ ] 7715 grant request payload type-checks against the kit.
- [ ] Webhook receiver reachable via ngrok.

If any of those is red after Day 0, we triage **before** writing any product
code. Cheap to find a blocker now. Catastrophic to find it on Day 5.
