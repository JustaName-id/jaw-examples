# JAW + Next.js SIWE

Full Sign-In With Ethereum (SIWE) flow with backend API routes, using `@jaw.id/wagmi`.

> **Docs:** [Getting Started](https://docs.jaw.id/getting-started)

## What This Demonstrates

- Generating a nonce on the server (`/api/siwe/nonce`)
- Requesting a SIWE signature via the JAW connector's `signInWithEthereum` capability
- Verifying the signature on-chain with `viem/siwe` (`/api/siwe/verify`)
- Setting an `HttpOnly` session cookie on successful verification
- Clearing the session on logout (`/api/siwe/logout`)
- Displaying authenticated state with the verified address

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

4. Open [http://localhost:3000](http://localhost:3000) and click **Sign In With Ethereum**.

## Production Notes

- Store the nonce in a server-side session or cache and validate it during verification to prevent replay attacks.
- Replace the raw `Set-Cookie` approach with a proper session library (e.g. `iron-session` or JWT).
- Add CSRF protection to the verify and logout endpoints.
