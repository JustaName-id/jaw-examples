# EIP-7702 + Turnkey

An interactive CLI that upgrades a Turnkey-managed EOA to a JAW smart account via EIP-7702 — preserving the original address while gaining smart account features.

## What This Demonstrates

| Feature | API |
|---------|-----|
| Create or load a Turnkey wallet | `@turnkey/sdk-server` |
| Convert Turnkey wallet to viem LocalAccount | `@turnkey/viem` `createAccount` |
| Upgrade EOA to smart account via EIP-7702 | `Account.fromLocalAccount` with `{ eip7702: true }` |
| Sign a message | `account.signMessage` |
| Send a transaction (triggers delegation on first call) | `account.sendTransaction` |

## Setup

1. Copy the environment file and fill in your values:
   ```bash
   cp examples/eip7702/turnkey/.env.example examples/eip7702/turnkey/.env
   ```

   | Variable | Required | Description |
   |---|---|---|
   | `TURNKEY_ORGANIZATION_ID` | Yes | Your org ID from [dashboard.turnkey.com](https://dashboard.turnkey.com) |
   | `TURNKEY_API_PUBLIC_KEY` | Yes | Turnkey API public key |
   | `TURNKEY_API_PRIVATE_KEY` | Yes | Turnkey API private key |
   | `JAW_API_KEY` | Yes | Your API key from [dashboard.jaw.id](https://dashboard.jaw.id) |

   > The EOA needs ETH on Base Sepolia for gas.

2. From the repo root, run:
   ```bash
   npx nx dev eip7702-turnkey
   ```

## Expected Output

```
--- Turnkey + JAW EIP-7702 ---

  [1] Create new wallet
  [2] Load existing wallet

  Choice: 1

  Creating new Turnkey wallet...
  Wallet ID: wlt_...
  EOA Address: 0xabc...

  Creating viem account...
  Creating JAW smart account with EIP-7702...
  Smart Account : 0xabc...
  Same address  : true
  Chain ID      : 84532

  [1] Sign a message
  [2] Send transaction
  [3] Account info
  [4] Exit
```

## Key Concepts

**Turnkey integration** — Turnkey manages the private key remotely. `@turnkey/viem` converts it into a viem `LocalAccount` that the JAW SDK can use directly.

**EIP-7702 delegation** — the first transaction automatically signs an authorization and delegates the EOA to the smart account implementation. Subsequent transactions skip this step.

**Address preservation** — passing `{ eip7702: true }` to `Account.fromLocalAccount` ensures the smart account address matches the original Turnkey EOA address.
