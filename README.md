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

## Quick Start

1. Get an API key at [dashboard.jaw.id](https://dashboard.jaw.id)
2. Clone this repo
3. Navigate to an example:
   ```bash
   cd examples/nextjs-wagmi
   ```
4. Copy the environment file and add your API key:
   ```bash
   cp .env.example .env.local
   ```
5. Install and run:
   ```bash
   bun install
   bun dev
   ```

## Documentation

- [Full Documentation](https://docs.jaw.id)
- [Dashboard](https://dashboard.jaw.id)

## License

MIT
