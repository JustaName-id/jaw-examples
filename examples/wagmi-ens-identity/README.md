# Example: ENS identity (wagmi · iframe)

wagmi `jaw()` connector with the default embedded iframe. Post-connect action:
resolve and display the connected account's **ENS subname** — the JustaName
identity layer that travels with the user across dApps.

## Run

From the repo root, after `bun install`:

```bash
npx nx dev wagmi-ens-identity
```

Set your API key in `examples/wagmi-ens-identity/.env.local`:

```bash
VITE_JAW_API_KEY=<your-key>
# VITE_RPC_URL=https://sepolia.base.org   # optional (defaults to Base Sepolia)
# VITE_KEYS_URL=http://localhost:3001     # optional (local keys app)
```

## What it shows

- Connect, then reverse-resolve the address → ENS subname via the JustaName endpoint.
- Subnames are off-chain, so resolution uses `api.justaname.id` (not a plain on-chain lookup).
- Shows the user's portable identity right after connect.
