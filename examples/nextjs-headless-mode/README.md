# JAW Next.js Headless Mode

A Next.js app demonstrating the headless `Account` API from `@jaw.id/core` — direct access to passkey account operations without any wallet connector or provider abstraction.

## What This Demonstrates

| Page | Feature | API |
| --- | --- | --- |
| `/` | Create, login, and import passkey accounts | `Account.create`, `Account.get`, `Account.import` |
| `/transactions` | Send ETH and batch transfers | `account.sendCalls` |
| `/signing` | Sign messages and typed data | `account.signMessage` |
| `/permissions` | Grant, list, and revoke ERC-7715 permissions | `account.grantPermissions`, `account.getPermissions`, `account.revokePermissions` |

## Setup

1. Copy the environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your values:

   | Variable | Required | Description |
   | --- | --- | --- |
   | `NEXT_PUBLIC_JAW_API_KEY` | Yes | API key from [dashboard.jaw.id](https://dashboard.jaw.id) |

3. Install and run:
   ```bash
   bun install
   bun dev
   ```

Open [http://localhost:3000](http://localhost:3000) to get started.

## Key Concepts

**Headless mode** — uses `Account` methods directly instead of an EIP-1193 provider. This gives full control over the account lifecycle and is ideal when you need to build a fully custom UI or integrate into a non-standard environment.

**Account lifecycle**

- `Account.create(config, { username })` — register a new passkey and deploy a smart account
- `Account.get(config, credentialId)` — resume an existing account by credential ID
- `Account.import(config)` — import an account from a passkey already stored on the device
- `Account.logout(apiKey)` — clear the local session

**`Account.getStoredAccounts(apiKey)`** — returns all credentials stored locally so users can pick an account without re-authenticating.

## Documentation

- [JAW Docs](https://docs.jaw.id)
- [Dashboard](https://dashboard.jaw.id)
