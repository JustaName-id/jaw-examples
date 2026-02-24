# JAW Next.js + Wagmi Examples

A multi-page Next.js app demonstrating every major JAW SDK feature using the `@jaw.id/wagmi` connector with wagmi and TanStack Query.

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

1. Copy the environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your values:

   | Variable | Required | Description |
   | --- | --- | --- |
   | `NEXT_PUBLIC_JAW_API_KEY` | Yes | API key from [dashboard.jaw.id](https://dashboard.jaw.id) |
   | `NEXT_PUBLIC_PIMLICO_API_KEY` | Gas sponsorship | Pimlico API key for the ERC-20 paymaster |
   | `NEXT_PUBLIC_ENS_DOMAIN` | ENS features | Your `.eth` domain for subname minting |
   | `NEXT_PUBLIC_ALCHEMY_API_KEY` | ENS features | Alchemy key for ENS profile resolution |
   | `SPENDER_PRIVATE_KEY` | Subscription | Private key of the server-side spender account |
   | `JAW_API_KEY` | Subscription | Server-side API key (same value as the public one) |

3. Install and run:
   ```bash
   bun install
   bun dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the example gallery.

## Key Concepts

**`@jaw.id/wagmi` connector** — drop-in wagmi connector configured in `lib/config.ts`. Adds passkey smart accounts to any wagmi app with no changes to existing wagmi hooks.

**Server-side execution** — the `/api` routes use `Account.fromLocalAccount` from `@jaw.id/core` to execute delegated calls on behalf of users (e.g. recurring subscription charges) without requiring a user signature at call time.

## Documentation

- [JAW Docs](https://docs.jaw.id)
- [Dashboard](https://dashboard.jaw.id)
