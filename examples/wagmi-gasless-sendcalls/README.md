# Example: Gasless batched calls (wagmi · iframe)

wagmi `jaw()` connector with JAW's **ERC-20 paymaster** configured. Post-connect
action: a batched, **gasless** EIP-5792 `wallet_sendCalls` — the smart account
pays the fee in an ERC-20 token, so no native ETH is needed.

## Run

From the repo root, after `bun install`:

```bash
npx nx dev wagmi-gasless-sendcalls
```

Set your API key in `examples/wagmi-gasless-sendcalls/.env.local`:

```bash
VITE_JAW_API_KEY=<your-key>
# VITE_KEYS_URL=http://localhost:3001     # optional (local keys app)
```

## What it shows

- `paymasters: { [chainId]: { url: JAW_PAYMASTER_URL } }` on the connector → sponsored gas.
- `useSendCalls` sends a batch (here one no-op self-call; replace with approve + swap, etc.).
- The returned batch `id` confirms submission.

> The account must hold the paymaster's fee token. Swap in your own paymaster URL for production.
