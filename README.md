# JAW Examples

Official examples for the [JAW SDK](https://docs.jaw.id) — identity-first smart accounts with passkey authentication, batch operations, and delegated permissions.

## Examples

### `@jaw.id/wagmi` — React / Next.js with wagmi

| Example | Description |
| --- | --- |
| [nextjs-wagmi](./examples/nextjs-wagmi) | Connect, sign, transact, permissions, ENS, SIWE, and subscriptions using the wagmi connector |

### `@jaw.id/core` — Framework-agnostic

| Example | Description |
| --- | --- |
| [nextjs-core](./examples/nextjs-core) | Same features as `nextjs-wagmi` using the raw JAW EIP-1193 provider (no wagmi) |
| [nextjs-headless-mode](./examples/nextjs-headless-mode) | Headless `Account` API — create, login, import passkeys, sign, transact, and manage permissions |
| [node-quickstart](./examples/node-quickstart) | Server-side smart account: sign messages, send and batch transactions in Node.js |

### EIP-7702 — Upgrade EOA to smart account

| Example | Description |
| --- | --- |
| [eip7702/node-quickstart](./examples/eip7702/node-quickstart) | Upgrade a private key EOA via EIP-7702 — sign, send, and batch in Node.js |
| [eip7702/turnkey](./examples/eip7702/turnkey) | Interactive CLI upgrading a [Turnkey](https://turnkey.com) wallet via EIP-7702 |
| [eip7702/privy-nextjs](./examples/eip7702/privy-nextjs) | Next.js app upgrading a [Privy](https://privy.io) embedded wallet via EIP-7702 |

### KMS Integrations — Server-side key management

| Example | Description |
| --- | --- |
| [kms/turnkey](./examples/kms/turnkey) | JAW smart accounts backed by [Turnkey](https://turnkey.com) server wallets |
| [kms/privy](./examples/kms/privy) | JAW smart accounts backed by [Privy](https://privy.io) server wallets |

## Quick Start

1. Get an API key at [dashboard.jaw.id](https://dashboard.jaw.id)
2. Clone this repo and install all dependencies once from the root:
   ```bash
   bun install
   ```
3. Copy the environment file for the example you want to run and fill in your keys:
   ```bash
   cp examples/nextjs-wagmi/.env.example examples/nextjs-wagmi/.env.local
   ```
4. Run any example from the root:
   ```bash
   npx nx dev nextjs-wagmi
   ```

   Replace `nextjs-wagmi` with any example name: `nextjs-core`, `nextjs-headless-mode`, `node-quickstart`, `eip7702-node-quickstart`, `eip7702-turnkey`, `eip7702-privy-nextjs`, `kms-turnkey`, or `kms-privy`.

## Documentation

- [Full Documentation](https://docs.jaw.id)
- [Dashboard](https://dashboard.jaw.id)

## License

MIT
