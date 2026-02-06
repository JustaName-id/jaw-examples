# JAW + Next.js Permissions

Grant, list, and revoke spending permissions for a passkey smart account using `@jaw.id/wagmi`.

> **Docs:** [Permissions](https://docs.jaw.id/permissions)

## What This Demonstrates

- Granting a scoped spending permission with `useGrantPermissions`
- Listing active permissions with `usePermissions`
- Revoking a permission by ID with `useRevokePermissions`
- Configuring token allowance, duration, and permitted function calls

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
