# JAW + Next.js Gas Sponsorship

Send gasless transactions using paymaster sponsorship with `@jaw.id/wagmi`.

> **Docs:** [Gas Sponsorship](https://docs.jaw.id/gas-sponsorship)

## What This Demonstrates

- Configuring the JAW connector with a paymaster (Pimlico)
- Sending gas-sponsored transactions where the user pays zero gas fees
- Using `useSendCalls` from wagmi with automatic paymaster integration
- No special client-side code needed -- sponsorship is handled by the connector config

## What Are Paymasters?

Paymasters are smart contracts on ERC-4337 (account abstraction) networks that pay gas fees on behalf of users. Instead of requiring end users to hold ETH for gas, a paymaster sponsors the transaction costs. This is the standard way to offer "gasless" or "free" transactions in smart account wallets.

The JAW connector accepts a `paymasters` configuration that maps chain IDs to paymaster RPC URLs. When a transaction is sent, the connector automatically routes it through the paymaster for gas sponsorship.

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Copy the environment file and add your API keys:
   ```bash
   cp .env.example .env.local
   ```
   - **JAW API key:** Get yours at [dashboard.jaw.id](https://dashboard.jaw.id).
   - **Pimlico API key:** Sign up at [dashboard.pimlico.io](https://dashboard.pimlico.io) and create an API key with a sponsorship policy for the Base network.

3. Start the dev server:
   ```bash
   bun run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000), connect your wallet, and send a gasless transaction.

## Paymaster Configuration

The key difference from a standard JAW setup is the `paymasters` option passed to the `jaw()` connector:

```ts
jaw({
  apiKey: process.env.NEXT_PUBLIC_JAW_API_KEY!,
  appName: "JAW Gas Sponsorship",
  paymasters: {
    [base.id]: {
      url: `https://api.pimlico.io/v2/${base.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`,
    },
  },
});
```

The `paymasters` object maps chain IDs to paymaster RPC endpoints. Any transaction sent on a chain with a configured paymaster will automatically have its gas fees sponsored.

## Getting a Pimlico API Key

1. Go to [dashboard.pimlico.io](https://dashboard.pimlico.io) and create an account.
2. Create a new project or use the default one.
3. Copy your API key from the dashboard.
4. In the Pimlico dashboard, create a **sponsorship policy** for the Base network (chain ID 8453) to define which transactions your paymaster will sponsor.
