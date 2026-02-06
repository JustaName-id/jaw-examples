# JAW ENS Profiles

ENS subnames and on-chain identity using [`@jaw.id/wagmi`](https://www.npmjs.com/package/@jaw.id/wagmi) and [`@justaname.id/sdk`](https://www.npmjs.com/package/@justaname.id/sdk).

## What this example demonstrates

- **JAW config with ENS** -- setting the `ens` option to bind a domain to your app
- **Connect with `subnameTextRecords`** -- claiming a subname and writing avatar, description, and URL text records on connect
- **Profile resolution** -- looking up any ENS name to read its on-chain text records
- **Reverse resolution** -- resolving an Ethereum address back to its primary ENS name

## Getting started

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_JAW_API_KEY` | Your JAW API key |
| `NEXT_PUBLIC_ENS_DOMAIN` | The parent ENS domain for subnames (e.g. `yourdomain.eth`) |
| `NEXT_PUBLIC_ALCHEMY_API_KEY` | Alchemy API key for mainnet RPC access |

### 3. Run the dev server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project structure

```
app/
  globals.css          Tailwind v4 entry point
  layout.tsx           Root layout with Providers wrapper
  page.tsx             Home page composing ConnectButton and ProfileResolver
  providers.tsx        WagmiProvider + QueryClientProvider setup
components/
  connect-button.tsx   Wallet connect with subnameTextRecords capability
  profile-resolver.tsx ENS name and address lookup using @justaname.id/sdk
lib/
  config.ts            JAW wagmi config with ENS domain
```

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [wagmi v2](https://wagmi.sh/)
- [@jaw.id/wagmi](https://www.npmjs.com/package/@jaw.id/wagmi)
- [@justaname.id/sdk](https://www.npmjs.com/package/@justaname.id/sdk)
- [Bun](https://bun.sh/)
