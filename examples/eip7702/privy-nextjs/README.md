# EIP-7702 + Privy (Next.js)

A Next.js app that upgrades a Privy embedded wallet to a JAW smart account via EIP-7702 — preserving the original address while gaining smart account features.

## What This Demonstrates

| Feature | API |
|---------|-----|
| Login with Privy (email, social, etc.) | `@privy-io/react-auth` `usePrivy` |
| Auto-create embedded wallet on login | `useCreateWallet` |
| Convert Privy wallet to viem LocalAccount | `toViemAccount` |
| Upgrade EOA to smart account via EIP-7702 | `Account.fromLocalAccount` with `{ eip7702: true }` |
| Sign a message | `account.signMessage` |
| Send a transaction with status polling | `account.sendCalls` + `account.getCallStatus` |

## Setup

1. Copy the environment file and fill in your values:
   ```bash
   cp examples/eip7702/privy-nextjs/.env.example examples/eip7702/privy-nextjs/.env
   ```

   | Variable | Required | Description |
   |---|---|---|
   | `NEXT_PUBLIC_PRIVY_APP_ID` | Yes | Your App ID from [dashboard.privy.io](https://dashboard.privy.io) |
   | `NEXT_PUBLIC_JAW_API_KEY` | Yes | Your API key from [dashboard.jaw.id](https://dashboard.jaw.id) |

   > The EOA needs ETH on Base Sepolia for gas, or configure a paymaster.

2. From the repo root, run:
   ```bash
   npx nx dev eip7702-privy-nextjs
   ```

## How It Works

1. User logs in via Privy (email, Google, etc.)
2. Privy auto-creates an embedded wallet
3. `toViemAccount` converts the embedded wallet into a viem `LocalAccount`
4. `Account.fromLocalAccount` with `{ eip7702: true }` upgrades it to a smart account
5. The smart account address matches the original Privy EOA address

## Key Concepts

**Privy integration** — Privy handles auth and wallet creation. `toViemAccount` from `@privy-io/react-auth` converts the embedded wallet into a `LocalAccount` that the JAW SDK can use directly.

**EIP-7702 delegation** — the first `sendCalls` automatically signs an authorization and delegates the EOA to the smart account implementation. Subsequent calls skip this step.

**`sendCalls` + `getCallStatus`** — `sendCalls` returns immediately with a user operation ID. You must poll `getCallStatus` to confirm the transaction is mined.
