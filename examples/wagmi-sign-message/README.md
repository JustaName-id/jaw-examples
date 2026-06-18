# Example: Sign a message (wagmi · iframe)

The canonical integration: the **wagmi** `jaw()` connector with the **default
embedded-iframe** transport. Post-connect action: **sign a personal message**
(EIP-191) and show the signature.

## Run

From the repo root, after `bun install`:

```bash
npx nx dev wagmi-sign-message
```

Set your API key in `examples/wagmi-sign-message/.env.local`:

```bash
VITE_JAW_API_KEY=<your-key>
# VITE_KEYS_URL=http://localhost:3001     # optional (local keys app)
```

## What it shows

- Connect via the wagmi connector.
- The embedded keys dialog (see-through) handles the passkey.
- `useSignMessage` triggers a `personal_sign`; the signature is displayed.
