# JAW Next.js + Core Examples

A multi-page Next.js app demonstrating every major JAW SDK feature using the `@jaw.id/core` provider API directly — no wagmi, no connectors, just the raw EIP-1193 provider.

## What This Demonstrates

| Page | Feature |
| --- | --- |
| `/quickstart` | Connect & disconnect with a passkey smart account |
| `/sign-message` | `personal_sign` and EIP-712 typed data signing |
| `/send-transaction` | Single, batch, and ERC-20 transactions |
| `/gas-sponsorship` | Gasless transactions via paymaster |
| `/permissions` | Grant & revoke ERC-7715 permissions |
| `/ens-profiles` | ENS subnames & on-chain profile resolution |
| `/siwe` | Sign-In With Ethereum (SIWE) |
| `/subscription` | Recurring USDC payments with delegated execution |

## Setup

1. Create a `.env.local` file with your values:

   | Variable | Required | Description |
   | --- | --- | --- |
   | `NEXT_PUBLIC_JAW_API_KEY` | Yes | API key from [dashboard.jaw.id](https://dashboard.jaw.id) |
   | `NEXT_PUBLIC_PIMLICO_API_KEY` | Gas sponsorship | Pimlico API key for the ERC-20 paymaster |
   | `NEXT_PUBLIC_ENS_DOMAIN` | ENS features | Your `.eth` domain for subname minting |
   | `NEXT_PUBLIC_ALCHEMY_API_KEY` | ENS features | Alchemy key for ENS profile resolution |
   | `SPENDER_PRIVATE_KEY` | Subscription | Private key of the server-side spender account |
   | `JAW_API_KEY` | Subscription | Server-side API key (same value as the public one) |

2. From the repo root, run:
   ```bash
   npx nx dev nextjs-core
   ```

Open [http://localhost:3000](http://localhost:3000) to see the example gallery.

## Key Concepts

**`JAW.create()`** — singleton initialized once in `lib/jaw.ts`. Returns a `jaw` object that exposes an EIP-1193 `jaw.provider`.

**`jaw.provider.request()`** — all wallet operations go through this single method:

| Operation | Method |
| --- | --- |
| Connect | `wallet_connect` |
| Disconnect | `wallet_disconnect` |
| Silent restore | `eth_accounts` |
| Sign message | `personal_sign` |
| Sign typed data | `eth_signTypedData_v4` |
| Send transactions | `wallet_sendCalls` |
| Permissions | `wallet_grantPermissions`, `wallet_getPermissions`, `wallet_revokePermissions` |

**Server-side execution** — the `/api` routes use `Account.fromLocalAccount` from `@jaw.id/core` to execute delegated calls without a user signature at call time.

## Documentation

- [JAW Docs](https://docs.jaw.id)
- [Dashboard](https://dashboard.jaw.id)
