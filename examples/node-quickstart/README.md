# JAW Node Quickstart

A minimal Node.js script that walks through the core JAW backend API step by step — no framework, no server, just plain TypeScript.

## What This Demonstrates

| Step | Feature | API |
|------|---------|-----|
| 1 | Create a server-side smart account from a private key | `Account.fromLocalAccount` |
| 2 | Sign a message (off-chain, no ETH needed) | `account.signMessage` |
| 3 | Send ETH — single transfer, waits for confirmation | `account.sendTransaction` |
| 4 | Batch send — two transfers in one user operation | `account.sendCalls` |

## Setup

1. Copy the environment file and fill in your values:
   ```bash
   cp examples/node-quickstart/.env.example examples/node-quickstart/.env
   ```

   | Variable | Description |
   |---|---|
   | `JAW_API_KEY` | Your API key from [dashboard.jaw.id](https://dashboard.jaw.id) |
   | `PRIVATE_KEY` | Private key of the account that will send transactions |
   | `RECIPIENT_ADDRESS` | Address that receives the demo ETH transfers |

   > Your account needs ~0.001 ETH on Base to cover the amounts and gas for Steps 3 & 4.

2. From the repo root, run:
   ```bash
   npx nx dev node-quickstart
   ```

## Expected Output

```
=== JAW Node Quickstart ===

Step 1 — Create account
  address : 0xabc...
  balance : 0.005 ETH
  chain   : Base (8453)

Step 2 — Sign a message
  message   : "Hello from JAW!"
  signature : 0x...

Step 3 — Send ETH (single, waits for confirmation)
  to     : 0xrecipient...
  amount : 0.0001 ETH
  hash   : 0x...

Step 4 — Batch send (two transfers, one user op)
  batch ID : 0x...
  waiting  : ....confirmed

✓ All steps complete.
```

## Key Concepts

**`Account.fromLocalAccount`** — the server-side entry point. Takes a viem local account (private key) instead of a passkey. No browser required.

**`sendTransaction` vs `sendCalls`**
- `sendTransaction` — submits one call and waits until it is mined. Returns a tx hash.
- `sendCalls` — submits one or more calls as a single user operation and returns immediately with a batch ID. Poll `getCallStatus` to check confirmation.

**Batch atomicity** — all calls in a `sendCalls` batch succeed or fail together. One approval, one gas payment.
