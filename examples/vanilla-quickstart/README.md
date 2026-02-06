# JAW Vanilla Quickstart

The framework-free version -- demonstrates using `@jaw.id/core` directly with plain HTML + TypeScript, bundled with Vite.

> **Docs:** [Getting Started](https://docs.jaw.id/getting-started)

## What This Demonstrates

- Installing and configuring `@jaw.id/core` without any framework
- Creating a JAW instance with `JAW.create()`
- Connecting and disconnecting via the provider's JSON-RPC interface
- Sending ETH with `wallet_sendCalls`
- Signing messages with `personal_sign`
- Listening to provider events (`accountsChanged`, `chainChanged`, `connect`, `disconnect`)
- Restoring an existing session on page load with `eth_accounts`

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Copy the environment file and add your API key:
   ```bash
   cp .env.example .env
   ```
   Get your API key at [dashboard.jaw.id](https://dashboard.jaw.id).

3. Start the dev server:
   ```bash
   bun run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) and click **Connect Wallet**.

## Project Structure

```
vanilla-quickstart/
  index.html          # Single HTML page with Tailwind classes
  src/
    main.ts           # All JAW SDK logic -- connect, send, sign, events
    style.css         # Tailwind CSS entry point
  vite.config.ts      # Vite + Tailwind CSS v4 plugin
  tsconfig.json       # TypeScript configuration
  package.json
```

## Key Concepts

### No framework required

`@jaw.id/core` exposes a standard EIP-1193 provider. You call `provider.request()` with JSON-RPC methods and listen to events with `provider.on()`. This works in any JavaScript environment -- no React, no Vue, no dependencies beyond the SDK itself.

### Provider methods used

| Method              | Purpose                        |
| ------------------- | ------------------------------ |
| `wallet_connect`    | Open the passkey connect flow  |
| `wallet_disconnect` | End the current session        |
| `eth_accounts`      | Get connected accounts         |
| `wallet_sendCalls`  | Send one or more transactions  |
| `personal_sign`     | Sign an arbitrary message      |
