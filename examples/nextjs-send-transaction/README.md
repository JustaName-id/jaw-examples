# JAW + Next.js Send Transaction

Send single and batch transactions from a passkey smart account using `@jaw.id/wagmi`.

> **Docs:** [Sending Transactions](https://docs.jaw.id/sending-transactions)

## What This Demonstrates

- Sending a single ETH transfer with `useSendCalls` from wagmi
- Batching multiple ETH transfers into a single call
- Encoding and sending an ERC-20 token transfer with `encodeFunctionData` from viem
- Displaying transaction status (submitted / failed)
- Connecting and disconnecting with `useConnect` and `useDisconnect` from `@jaw.id/wagmi`

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

4. Open [http://localhost:3000](http://localhost:3000), connect your wallet, and try sending a transaction.
