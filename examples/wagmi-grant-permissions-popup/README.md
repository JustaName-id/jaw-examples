# Example: Grant a scoped permission (wagmi · popup)

wagmi `jaw()` connector with the **popup** transport. Post-connect action: grant
a scoped **ERC-7715** permission — a capped spend per period plus a specific call
the spender may make. This is the building block for **agents / sessions** that
act within a bounded, revocable budget.

## Run

From the repo root, after `bun install`:

```bash
npx nx dev wagmi-grant-permissions-popup
```

Set your API key in `examples/wagmi-grant-permissions-popup/.env.local`:

```bash
VITE_JAW_API_KEY=<your-key>
# VITE_KEYS_URL=http://localhost:3001     # optional (local keys app)
```

## What it shows

- `useGrantPermissions({ spender, expiry, permissions })` from `@jaw.id/wagmi`.
- A `spends` limit (1 USDC/day) + a `calls` scope (`transfer(address,uint256)`).
- The keys popup shows the consent screen with the limits; the result is displayed.

> Granting registers the permission on-chain, so the account needs gas (or a
> paymaster). Replace `SPENDER`/`USDC` with your own session key and token.
