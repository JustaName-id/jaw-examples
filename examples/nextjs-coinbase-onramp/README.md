# JAW Coinbase On-Ramp

A Next.js app that buys **USDC on Base** into a passkey smart account, using the
Coinbase guest-checkout on-ramp behind the JustaName proxy. No Coinbase account,
no seed phrase — the user pays with Apple Pay / Google Pay and the USDC lands
straight in their `@jaw.id/core` smart account.

## What This Demonstrates

| Page | Feature |
| --- | --- |
| `/` | Create / login / import a passkey smart account (`@jaw.id/core`) |
| `/buy` | Phone-OTP → Coinbase payment iframe → live order status |

The proxy `x-api-key` never reaches the browser: the UI calls our own Next.js
route handlers (`app/api/onramp/*`), which forward to the proxy server-side.

```
Browser ──► /api/onramp/start        ──► proxy /proxy/v2/onramp/start
        ──► /api/onramp/validate-otp ──► proxy /proxy/v2/onramp/validate-otp
        ──► /api/onramp/orders/[id]  ──► proxy /proxy/v2/onramp/orders/:id
```

## Flow

1. **Connect** a passkey account on `/`. Its address is the on-ramp destination.
2. On `/buy`, enter US phone (E.164 `+1…`), email, and amount ($2–$500).
3. `POST /start` → proxy sends an SMS OTP via Twilio Verify.
4. Enter the code → `POST /validate-otp` → proxy creates the Coinbase order and
   returns an `embeddable.url`.
5. The app embeds that URL in an `<iframe allow="payment">` for Apple/Google Pay.
6. The app polls `GET /orders/:id` every 4s until `COMPLETED` / `FAILED` /
   `EXPIRED`. Settlement is driven by the Coinbase webhook hitting the proxy.

## Setup

1. Copy the environment file:
   ```bash
   cp examples/nextjs-coinbase-onramp/.env.example examples/nextjs-coinbase-onramp/.env.local
   ```

2. Fill in your values:

   | Variable | Scope | Description |
   | --- | --- | --- |
   | `NEXT_PUBLIC_JAW_API_KEY` | browser | Publishable key from [dashboard.jaw.id](https://dashboard.jaw.id) |
   | `ONRAMP_PROXY_BASE_URL` | server | Proxy base incl. `/proxy/v2/onramp` |
   | `ONRAMP_API_KEY` | server | `x-api-key` the proxy expects |

3. From the repo root, run:
   ```bash
   npx nx dev nextjs-coinbase-onramp
   ```

Open [http://localhost:3000](http://localhost:3000).

## Constraints (enforced by Coinbase guest checkout)

- **US only** — phone must be `+1XXXXXXXXXX` (E.164).
- **USDC on Base** only.
- **$2–$500** per purchase (guest weekly cap).
- **OTP required** — Coinbase needs a verified phone for guest orders.

## Notes

- The smart account is created on Arbitrum Sepolia, but its counterfactual
  address is identical across EVM chains, so the same address receives USDC on
  Base.
- For local testing without real payments, run the proxy with `ONRAMP_SANDBOX=true`
  — the returned iframe URL points at the Coinbase sandbox payment sheet.

## Documentation

- [JAW Docs](https://docs.jaw.id)
- [Dashboard](https://dashboard.jaw.id)
