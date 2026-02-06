# JAW + Next.js Quickstart

The simplest example — connect and disconnect a passkey smart account using `@jaw.id/wagmi`.

> **Docs:** [Getting Started](https://docs.jaw.id/getting-started)

## What This Demonstrates

- Installing and configuring `@jaw.id/wagmi`
- Setting up the JAW connector with `createConfig`
- Wrapping your app with `WagmiProvider` and `QueryClientProvider`
- Using `useConnect` and `useDisconnect` from `@jaw.id/wagmi`
- Displaying the connected account address with `useAccount`

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Copy the environment file and add your API key:
   ```bash
   cp .env.example .env.local
   ```
   Get your API key at [dashboard.jaw.id](https://dashboard.jaw.id).

3. Start the dev server:
   ```bash
   bun run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) and click **Connect Wallet**.
