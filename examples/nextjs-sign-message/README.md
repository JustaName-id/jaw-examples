# JAW + Next.js Sign Message

Sign messages and typed data with a JAW passkey smart account using `@jaw.id/wagmi`.

> **Docs:** [Getting Started](https://docs.jaw.id/getting-started)

## What This Demonstrates

- Signing a plaintext message with `personal_sign` (EIP-191) via wagmi's `useSignMessage`
- Signing EIP-712 structured typed data via wagmi's `useSignTypedData`
- Displaying the resulting signature
- Connect and disconnect flow using `useConnect` and `useDisconnect` from `@jaw.id/wagmi`

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

4. Open [http://localhost:3000](http://localhost:3000), connect your wallet, and try signing a message.
