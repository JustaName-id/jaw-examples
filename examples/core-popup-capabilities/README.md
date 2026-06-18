# Example: Core SDK, no wagmi (popup)

Integration **without wagmi** — uses the core SDK's EIP-1193 provider directly
(`JAW.create().provider.request(...)`), with the **popup** transport. Post-connect
action: read the smart account's **wallet capabilities** (EIP-5792
`wallet_getCapabilities`) — gasless/paymaster, atomic batching, permissions, per chain.

## Run

From the repo root, after `bun install`:

```bash
npx nx dev core-popup-capabilities
```

Set your API key in `examples/core-popup-capabilities/.env.local`:

```bash
VITE_JAW_API_KEY=<your-key>
# VITE_KEYS_URL=http://localhost:3001     # optional (local keys app)
```

## What it shows

- No wagmi / React Query — just `JAW.create()` and `provider.request(...)`.
- `eth_requestAccounts` connects (popup); `wallet_getCapabilities` reads what the account supports.
- The same provider also serves `personal_sign`, `wallet_sendCalls`, `wallet_grantPermissions`, etc.
