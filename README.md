# JAW Examples

Official examples for the [JAW SDK](https://docs.jaw.id) — identity-first smart accounts with passkey authentication, batch operations, and delegated permissions.

## Examples

### `@jaw.id/wagmi` — React / Next.js

| Example                                                        | Description                                     |
| -------------------------------------------------------------- | ----------------------------------------------- |
| [nextjs-quickstart](./examples/nextjs-quickstart)              | Connect & disconnect with passkey wallet         |
| [nextjs-send-transaction](./examples/nextjs-send-transaction)  | Single & batch transactions                      |
| [nextjs-sign-message](./examples/nextjs-sign-message)          | Personal sign & EIP-712 typed data               |
| [nextjs-gas-sponsorship](./examples/nextjs-gas-sponsorship)    | Gasless transactions with paymaster              |
| [nextjs-ens-profiles](./examples/nextjs-ens-profiles)          | ENS subnames & on-chain identity                 |
| [nextjs-siwe](./examples/nextjs-siwe)                          | Sign-In With Ethereum (full-stack)               |
| [nextjs-permissions](./examples/nextjs-permissions)             | Grant, list & revoke permissions                 |
| [nextjs-subscription](./examples/nextjs-subscription)          | Subscription payments with delegated permissions |

### `@jaw.id/core` — Vanilla JS / Node.js

| Example                                                        | Description                                     |
| -------------------------------------------------------------- | ----------------------------------------------- |
| [vanilla-quickstart](./examples/vanilla-quickstart)            | Core SDK usage without frameworks                |
| [node-server-charge](./examples/node-server-charge)            | Server-side permission execution                 |

## Quick Start

1. Get an API key at [dashboard.jaw.id](https://dashboard.jaw.id)
2. Clone this repo
3. Navigate to an example:
   ```bash
   cd examples/nextjs-quickstart
   ```
4. Copy the environment file and add your API key:
   ```bash
   cp .env.example .env.local
   ```
5. Install and run:
   ```bash
   bun install
   bun run dev
   ```

## Documentation

- [Full Documentation](https://docs.jaw.id)
- [Dashboard](https://dashboard.jaw.id)

## License

MIT
