# JAW + Next.js Subscription

End-to-end subscription payments -- user grants permission on the client, server charges monthly using delegated execution, user can cancel. Uses `@jaw.id/wagmi` (client) and `@jaw.id/core` (server).

> **Docs:** [Permissions](https://docs.jaw.id/permissions)

## What This Demonstrates

- Granting a monthly USDC spending permission with `useGrantPermissions`
- Server-side charge execution with `Account.fromLocalAccount` and `sendCalls`
- Revoking permissions (cancelling a subscription) with `useRevokePermissions`
- Full client + server flow for recurring payments on Base

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Copy the environment file and add your keys:
   ```bash
   cp .env.example .env.local
   ```
   - `NEXT_PUBLIC_JAW_API_KEY` -- your client-side JAW API key
   - `JAW_API_KEY` -- your server-side JAW API key
   - `SPENDER_PRIVATE_KEY` -- private key of the spender account that will execute charges

   Get your API key at [dashboard.jaw.id](https://dashboard.jaw.id).

3. Update the spender and treasury addresses in `lib/constants.ts` to match your own.

4. Start the dev server:
   ```bash
   bun run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Flow

1. Connect your passkey wallet
2. Choose a plan (Basic $5/mo, Pro $15/mo, Enterprise $50/mo)
3. Approve the subscription (grants a monthly USDC spending permission)
4. View your active subscription with the permission ID
5. Click "Charge" to trigger a server-side charge (demo only -- in production this runs on a schedule)
6. Click "Cancel" to revoke the permission and end the subscription
