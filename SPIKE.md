# Day-0 Spike Log

> **Purpose.** Before we spend a week building DeleGate.AI, prove the four
> foundation primitives work end-to-end. Whatever doesn't work, capture the
> error and the workaround here so Day 1 starts from solid ground.

## Headline findings (Day-0)

| # | Finding | Action |
|---|---|---|
| 1 | **1Shot relayer is mainnet-only.** Sepolia + all Sepolia variants return empty capabilities. | First tried Celo mainnet (cheapest gas), then pivoted to **Base mainnet (8453)** — see finding #6. |
| 2 | **MetaMask Smart Accounts Kit 1.5.0 pins `viem ^2.31.4`.** Installing newer viem causes deep `Two different types with this name` errors. | Pinned `viem 2.31.4` via pnpm override in root `package.json`. |
| 3 | **viem's chain exports carry chain-specific block formatters.** They diverge from the generic `Chain` the kit expects. | Use `defineChain` to declare a plain chain definition inside the spike scripts. |
| 4 | 1Shot `relayer_getCapabilities` on Base (8453) confirms `targetAddress=0x26a529124f0bbf9af9d8f9f84a43efe47cf1199a`, tokens=USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`) + USDT. | Use Base USDC as `ONESHOT_FEE_TOKEN`. |
| 5 | 1Shot `relayer_getFeeData` on Base returns a real fee quote with `minFee=0.01 USDC` and a short-lived `expiresAt`. | Re-quote per payment; cache only inside a single tx submission. |
| 6 | **Venice's x402 inference rail is Base-only.** Payment requirements specify `network: eip155:8453`, `asset: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (Base USDC), `payTo: 0x2670b922ef37c7df47158725c0cc407b5382293f`, min top-up `5 USDC`. | Chain of record = **Base mainnet**. One wallet, one chain covers both Venice payments and 1Shot relayer fees. Story bonus: Venice + x402 combo is an explicit Venice scoring multiplier. |
| 7 | **Venice x402 SIWE auth works.** A wallet-signed EIP-4361 SIWE message scoped to `api.venice.ai` returns the payment-requirements payload on `POST /x402/top-up` (verified live, no funds moved). | Day-1: sign a USDC transferWithAuthorization for 5 USDC to `payTo`, submit as `X-402-Payment` header, then use `X-Sign-In-With-X` to access inference endpoints. |
| 8 | **Stateless7702 delegator implementation address resolved.** `EIP7702StatelessDeleGatorImpl` on Base = `0x63c0c19a282a1B52b07dD5a65b58948A07DAE32B` (deployment v1.3.0 from `@metamask/delegation-deployments`). | Pin v1.3.0; reference this address for all 7702 authorizations on Base. |
| 9 | **1Shot relayer only accepts 7710 redemptions.** `relayer_send7710Transaction` requires every entry in `transactions[]` to carry a `permissionContext` (encoded ERC-7710 delegation). There is no `relayer_send7702Transaction`. The 7702 upgrade must ride in-flight with the first 7710 redemption via `authorizationList`. | Architectural lock-in: every onchain action in DeleGate.AI is a 7710 redemption. Maximises Best x402+7710 scoring automatically. Day-1 task: build the first delegation + redeem flow. |
| 10 | Venice native image endpoint is `/image/generate` (not the OpenAI-shaped `/images/generations`). Response shape: `{ images: [base64, ...] }`. | Wired into spike 01. |

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

### ⏸ Spike 01 — Venice AI (deferred to spike 06 path)

| Endpoint | Status | Notes |
|---|---|---|
| `POST /chat/completions`   | ⏸ blocked by $0 balance | Will use x402 path (spike 06), not Bearer-key path. |
| `POST /image/generate`     | ⏸ blocked by $0 balance | Endpoint discovered: `/image/generate` (not the OpenAI-style `/images/generations`). |
| `POST /audio/speech`       | ⏸ blocked by $0 balance | |

**Findings.**
- Auth path via Bearer API key works (we received `402 Payment Required` rather than `401`).
- Image endpoint URL was wrong in the initial draft. Fixed.

**Decision.** Don't top up Venice via credit card. Go through the **x402 wallet path** in spike 06 — same USDC funding covers Venice + 1Shot relayer fees.

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
- [x] EOA address derived from `SPIKE_PRIVATE_KEY` is funded on **Base mainnet** ($6.97 USDC bridged from Ethereum via Relay.link)
- [x] `toMetaMaskSmartAccount({ implementation: Stateless7702 })` returns a typed account
- [x] Authorization signed with `account.signAuthorization` (chainId 8453, nonce 0)
- [x] Delegator implementation address resolved from `@metamask/delegation-deployments` v1.3.0: `0x63c0c19a282a1B52b07dD5a65b58948A07DAE32B`
- [ ] 1Shot `relayer_send7710Transaction` accepted the payload (deferred — see finding #9 below)
- [ ] `relayer_getStatus` reached `CONFIRMED`
- [ ] `eth_getCode` on the EOA now returns non-empty code (delegator installed)
- [ ] tx is visible at https://basescan.org/address/&lt;EOA&gt;

**Schema reverse-engineered (probe-1shot-7710-schema.ts):**
```
relayer_send7710Transaction params = {
  chainId:    "8453",                            // string
  feeToken:   "0x833589fCD…02913",                // Base USDC address
  transactions: [
    {
      target:            "0x…",
      value:             "0x0",
      data:              "0x…",
      permissionContext: "0x…"                    // REQUIRED — encoded 7710 delegation
    }
  ],
  authorizationList: [ /* viem-shaped 7702 auth, BigInt → string */ ]
}
```

**Available methods (probe-1shot-methods.ts):**
- `relayer_getCapabilities`
- `relayer_getFeeData`
- `relayer_send7710Transaction`             ← requires permissionContext per tx
- `relayer_send7710TransactionMultichain`   ← cross-chain variant
- `relayer_sendTransaction`                  ← still validates chainId
- `relayer_sendTransactionMultichain`        ← requires fee payment in calldata
- `relayer_getStatus`
- **NO** `relayer_send7702Transaction` or `relayer_upgradeAccount`

**Day-1 task carried forward.**
- Sign a 7710 self-delegation from the freshly upgraded EOA → encode `permissionContext` via the kit's caveat-builder / delegation-utils.
- Submit one `relayer_send7710Transaction` carrying both the 7702 `authorizationList` and the encoded `permissionContext` with a no-op execution.
- Observe the upgrade landing on basescan and the delegation being redeemed in the same tx.

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

### ✅ Spike 04 — ERC-7715 grant shape

**Steps verified.**
- [x] `@metamask/smart-accounts-kit/actions` exports `erc7715ProviderActions`
- [x] `walletClient.requestExecutionPermissions` exists on the extended client
- [x] The `erc20-token-periodic` permission payload type-checks (chainId 8453, 50 USDC weekly cap, 604800s period)
- [ ] (Browser leg — checked manually later) MetaMask extension renders the prompt

**Findings.**
- Surface area is correct, payload shape matches the docs.
- Session account address logs cleanly; nonce flow is straightforward.

**Decisions.**
- Caveat set for v1:
  - `maxSpend = 50 USDC / week` (slider in UI, $50 is default)
  - `expiresAt = now + 7d`
  - `allowedCallees = [registered service addresses]` (custom enforcer if not built-in)
  - `perCallCap = 30 USDC`
- If `allowedCallees` isn't a first-class caveat in `erc20-token-periodic`,
  add a custom caveat enforcer in `DelegateFacilitator.sol` and reference
  it via the delegation framework's `caveats` array. Day-1 spike will resolve this.

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

- [x] 1Shot capabilities + fee data come back for our chosen chain + token (Base 8453, USDC).
- [x] 7715 grant request payload type-checks against the kit.
- [x] Venice x402 SIWE auth returns the payment-requirements payload.
- [x] Delegator implementation address resolved from `@metamask/delegation-deployments`.
- [x] 7702 authorization signs cleanly with viem's `account.signAuthorization`.
- [x] **First real 7710 redemption + 7702 upgrade landed onchain** — spike 07. tx hash `0xf199a88f1f7e2d28005365acd5ba63793d166c6b1d94cf77a2a807f53746052c`, cost 0.02 USDC, EOA now carries `0xef0100…` delegation pointer to the Stateless7702 impl.
- [ ] Venice x402 inference call after a real $5 top-up (Day-1).
- [ ] Webhook receiver reachable via ngrok (manual step, no blocker risk).

**Verdict: Day-0 GREEN + first Day-1 redemption GREEN.** All architectural unknowns
are resolved. Remaining tasks are well-scoped implementation, not unknowns.

## Spike 07 — canonical schema (verified live)

This is the request that successfully landed a 7702 upgrade + 7710 redemption
on Base mainnet via the public 1Shot relayer:

```ts
{
  chainId: "8453",
  context: <fee.context JSON string from relayer_getFeeData>,
  authorizationList: [<viem-shape signed 7702 authorization>],   // max 1
  transactions: [
    {
      permissionContext: [<plain SignedDelegation object>],      // NOT hex
      executions: [
        { target: USDC, value: "0", data: <ERC20.transfer calldata> }
      ]
    }
  ]
}
```

Key correctness rules discovered (each one cost us a probe):
- The field is `context`, not `feeContext`.
- `permissionContext` is an array of plain `Delegation7710` objects (delegate,
  delegator, authority, caveats, salt, signature). It is **not** the
  hex-encoded blob returned by `encodeDelegations`.
- Each `transactions[i]` carries its own `permissionContext[]` and `executions[]`.
- `authorizationList` accepts at most one entry; viem's
  `account.signAuthorization` output (`{ address, chainId, nonce, r, s, v, yParity }`)
  is accepted as-is once BigInts are JSON-serialised as strings.
- The relayer returns the tx hash inline (`"0x…"` string), not a job id, when
  the tx is broadcast synchronously.

## Day-1 task carry-over

1. Encode a `permissionContext` for an ERC-7710 self-delegation (use kit's
   `getDelegationHashOffchain` + the caveat builder under
   `@metamask/smart-accounts-kit/actions`). Submit one
   `relayer_send7710Transaction` carrying the `authorizationList` + the
   encoded permission context with a no-op execution. Observe the upgrade
   on basescan.
2. Implement the Venice x402 top-up: build the EIP-712 transferWithAuthorization
   payload for 5 USDC → `0x2670b922ef37c7df47158725c0cc407b5382293f`, base64
   it as `X-402-Payment`, deposit $5 credit, then call `/chat/completions`
   with `X-Sign-In-With-X`. Confirm `X-Balance-Remaining` decreases.
3. Stand up the merchant-mock services with `GET /quote → 402` + `POST /charge`.
4. Wire a webhook handler that consumes `TransactionConfirmed` events from
   1Shot and pushes Server-Sent Events to the frontend.
5. Decide `allowedCallees` enforcement: built-in caveat or custom
   `DelegateFacilitator.sol`.
