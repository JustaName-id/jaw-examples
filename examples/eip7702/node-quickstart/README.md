# EIP-7702 Node Quickstart

A minimal Node.js script that upgrades an EOA to a JAW smart account via EIP-7702 — preserving the original address while gaining smart account features (batching, gas sponsorship, permissions).

## What This Demonstrates

| Step | Feature | API |
|------|---------|-----|
| 1 | Create an EIP-7702 smart account from a private key | `Account.fromLocalAccount` with `{ eip7702: true }` |
| 2 | Sign a message (off-chain, no delegation needed) | `account.signMessage` |
| 3 | Send a transaction (triggers EIP-7702 delegation on first call) | `account.sendCalls` + `account.getCallStatus` |
| 4 | Send a second transaction (delegation already active, no overhead) | `account.sendCalls` + `account.getCallStatus` |

## Setup

1. Copy the environment file and fill in your values:
   ```bash
   cp examples/eip7702/node-quickstart/.env.example examples/eip7702/node-quickstart/.env
   ```

   | Variable | Required | Description |
   |---|---|---|
   | `JAW_API_KEY` | Yes | Your API key from [dashboard.jaw.id](https://dashboard.jaw.id) |
   | `PRIVATE_KEY` | Yes | Private key of the EOA to upgrade via EIP-7702 |
   | `PAYMASTER_URL` | No | Paymaster URL for gas sponsorship (e.g. Pimlico) |

   > Without a paymaster, the EOA needs ETH on Base Sepolia for gas.

2. From the repo root, run:
   ```bash
   npx nx dev eip7702-node-quickstart
   ```

## Expected Output

```
=== EIP-7702 Node Quickstart ===

Step 1 — Create EIP-7702 account
  EOA address     : 0xabc...
  Account address : 0xabc...
  Same address    : true
  Chain           : Base Sepolia (84532)

Step 2 — Sign a message
  message   : "Hello from EIP-7702!"
  signature : 0x1234...

Step 3 — Send transaction (triggers delegation on first call)
  userOp hash : 0x...
  waiting     : ....confirmed

Step 4 — Second call (delegation already active, just sends)
  userOp hash : 0x...
  waiting     : ..confirmed

✓ All steps complete.
```

## Key Concepts

**EIP-7702 delegation** — the first `sendCalls` automatically signs an authorization, registers the permissions manager as an owner, and executes your call — all in a single UserOperation. Subsequent calls skip delegation entirely.

**Address preservation** — passing `{ eip7702: true }` to `Account.fromLocalAccount` ensures the smart account address matches the original EOA address. Without it, a new counterfactual address is created.

**`sendCalls` + `getCallStatus`** — `sendCalls` returns immediately with a user operation ID. You must poll `getCallStatus` to confirm the transaction is mined.
