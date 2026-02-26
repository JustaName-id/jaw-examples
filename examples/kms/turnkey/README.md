# JAW + Turnkey Server Wallets

A server-side example that uses [Turnkey](https://www.turnkey.com/) as the key management layer for JAW smart accounts — no browser or passkey required.

## What This Demonstrates

| Feature | Description |
|---------|-------------|
| Turnkey wallet creation | Create and manage HD wallets via Turnkey's server-side API |
| JAW smart account from Turnkey wallet | Wrap a Turnkey wallet into a JAW smart account |
| Message signing | Sign arbitrary messages off-chain |
| Send transactions | Send ETH transfers through the JAW smart account |

## How It Works

1. **Create or load** a Turnkey wallet (`@turnkey/sdk-server`)
2. **Convert** the Turnkey wallet into a viem `LocalAccount` (`@turnkey/viem`)
3. **Wrap** the local account into a JAW smart account (`Account.fromLocalAccount`)
4. **Interact** — sign messages, send transactions via an interactive CLI menu

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment file and fill in your values:
   ```bash
   cp .env.example .env.local
   ```

   | Variable | Description |
   |---|---|
   | `TURNKEY_ORGANIZATION_ID` | Your organization ID from [dashboard.turnkey.com](https://dashboard.turnkey.com) |
   | `TURNKEY_API_PUBLIC_KEY` | Your API public key |
   | `TURNKEY_API_PRIVATE_KEY` | Your API private key |
   | `JAW_API_KEY` | Your API key from [dashboard.jaw.id](https://dashboard.jaw.id) |

   > **Note:** Create an API key pair in your Turnkey dashboard under **API Keys**.

3. Run the script:
   ```bash
   npm run dev
   ```

## Expected Output

```
--- Turnkey + JAW Server Wallet ---

  [1] Create new wallet
  [2] Load existing wallet

  Choice: 1

  Creating new Turnkey wallet...
  Wallet ID: <turnkey-wallet-id>
  Address:   0xabc...
  Creating viem account...
  Creating JAW smart account...
  Smart Account: 0xdef...
  Chain ID:      84532

  [1] Sign a message
  [2] Send transaction
  [3] Account info
  [4] Exit
```

## Key Concepts

**Turnkey** — A key management infrastructure provider. Turnkey manages cryptographic keys on secure hardware, and your server interacts with wallets through their API. You never handle raw key material.

**`createAccount`** — From `@turnkey/viem`, bridges a Turnkey wallet into a viem-compatible `LocalAccount`, which JAW can then wrap into a smart account.

**`Account.fromLocalAccount`** — The JAW server-side entry point. Takes any viem `LocalAccount` (whether from a private key, Turnkey, or another KMS) and creates a smart account.
