# Example: Sign-In with Ethereum (wagmi · popup)

Same wagmi `jaw()` connector as the sign-message example, but with the **popup**
transport (`transportMode: 'popup'`) — the explicit opt-out from the default
embedded iframe. Post-connect action: **Sign-In with Ethereum** (EIP-4361) to
establish an authenticated session.

## Run

From the repo root, after `bun install`:

```bash
npx nx dev wagmi-siwe-popup
```

Set your API key in `examples/wagmi-siwe-popup/.env.local`:

```bash
VITE_JAW_API_KEY=<your-key>
# VITE_KEYS_URL=http://localhost:3001     # optional (local keys app)
```

## What it shows

- The **popup** transport: keys.jaw.id opens in a popup window (vs the inline iframe).
- Connect, then build a SIWE message (`viem/siwe`) and sign it — the keys popup shows its SIWE screen.
- The signed message + signature are displayed (a backend would verify them to start a session).
