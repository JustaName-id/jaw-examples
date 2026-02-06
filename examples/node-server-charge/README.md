# JAW + Node Server Charge

Server-side example that executes charges against a user's smart account using delegated permissions via `Account.fromLocalAccount` from `@jaw.id/core`.

> **Docs:** [Delegated Permissions](https://docs.jaw.id)

## What This Demonstrates

- Using `Account.fromLocalAccount` to create a server-side JAW Account from a private key (no passkey required)
- Executing ERC-20 charges on behalf of a user using a granted `permissionId`
- Estimating gas before submitting a charge
- Checking transaction status after submission

## How It Works

This example represents **the server half** of a delegated-charge flow:

1. **Client-side** (not in this example): A user connects their JAW smart account, then grants a spending permission to your server's *spender* address. This produces a `permissionId`.
2. **Server-side** (this example): Your backend holds the spender's private key and uses it with `Account.fromLocalAccount`. When you need to charge the user, you call `account.sendCalls` with the `permissionId` the user granted, and the JAW protocol enforces the permission's spending limits on-chain.

```
User (client)                         Your Server
     |                                      |
     |-- grants permission to spender ----->|
     |   (returns permissionId)             |
     |                                      |
     |           ... time passes ...        |
     |                                      |
     |<---- POST /charge { permissionId }---|
     |   (server executes charge via JAW)   |
```

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Copy the environment file and fill in your values:
   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   |---|---|
   | `JAW_API_KEY` | Your API key from [dashboard.jaw.id](https://dashboard.jaw.id) |
   | `SPENDER_PRIVATE_KEY` | Private key of the account that was granted permission to charge |
   | `PORT` | Port for the Express server (defaults to `3001`) |

3. Start the dev server:
   ```bash
   bun run dev
   ```

## API Endpoints

### `GET /health`

Returns server status and configuration.

```bash
curl http://localhost:3001/health
```

```json
{
  "ok": true,
  "spender": "0x...",
  "chainId": 8453,
  "treasury": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2",
  "usdc": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
}
```

### `POST /estimate`

Estimate gas for a charge without executing it.

```bash
curl -X POST http://localhost:3001/estimate \
  -H "Content-Type: application/json" \
  -d '{"permissionId": "0x...", "amount": "10"}'
```

| Field | Type | Description |
|---|---|---|
| `permissionId` | `string` | The permission ID granted by the user |
| `amount` | `string` | Amount of USDC to charge (human-readable, e.g. `"10"` for 10 USDC) |

```json
{
  "ok": true,
  "gas": "85000"
}
```

### `POST /charge`

Execute a charge against the user's account.

```bash
curl -X POST http://localhost:3001/charge \
  -H "Content-Type: application/json" \
  -d '{"permissionId": "0x...", "amount": "10"}'
```

| Field | Type | Description |
|---|---|---|
| `permissionId` | `string` | The permission ID granted by the user |
| `amount` | `string` | Amount of USDC to charge (human-readable, e.g. `"10"` for 10 USDC) |

```json
{
  "ok": true,
  "batchId": "0x..."
}
```

### `GET /status/:batchId`

Check the status of a previously submitted charge.

```bash
curl http://localhost:3001/status/0x...
```

```json
{
  "ok": true,
  "status": "confirmed",
  "receipts": [...]
}
```

## Security Considerations

- **Protect the spender private key.** Store it in environment variables or a secrets manager -- never commit it to source control.
- **Authenticate callers.** The `/charge` endpoint should be behind your own authentication layer so that only your trusted services can trigger charges.
- **Validate amounts server-side.** Always validate and sanitise the `amount` before building the transaction.
- **Use HTTPS in production.** Never expose this server over plain HTTP outside of local development.
- **Monitor permission usage.** The on-chain permission enforces spending limits, but you should also track charges in your own database for auditing.
