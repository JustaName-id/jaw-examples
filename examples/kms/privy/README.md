# JAW + Privy Server Wallets

A server-side example that uses [Privy Server Wallets](https://docs.privy.io/guide/server-wallets) as the key management layer for JAW smart accounts — no browser or passkey required.

## What This Demonstrates

| Feature | Description |
|---------|-------------|
| Privy server wallet creation | Create and manage wallets via Privy's server-side API |
| JAW smart account from Privy wallet | Wrap a Privy server wallet into a JAW smart account |
| Message signing | Sign arbitrary messages off-chain |
| Send transactions | Send ETH transfers through the JAW smart account |

## How It Works

1. **Create or load** a Privy server wallet (`@privy-io/server-auth`)
2. **Convert** the Privy wallet into a viem `LocalAccount` (`@privy-io/server-auth/viem`)
3. **Wrap** the local account into a JAW smart account (`Account.fromLocalAccount`)
4. **Interact** — sign messages, send transactions via an interactive CLI menu

## Setup

1. Copy the environment file and fill in your values:
   ```bash
   cp examples/kms/privy/.env.example examples/kms/privy/.env.local
   ```

   | Variable | Description |
   |---|---|
   | `PRIVY_APP_ID` | Your Privy app ID from [console.privy.io](https://dashboard.privy.io) |
   | `PRIVY_APP_SECRET` | Your Privy app secret |
   | `JAW_API_KEY` | Your API key from [dashboard.jaw.id](https://dashboard.jaw.id) |

   > **Note:** Enable **Server Wallets** in your Privy dashboard under the **Server Wallets** tab.

2. From the repo root, run:
   ```bash
   npx nx dev kms-privy
   ```

## Expected Output

```
--- Privy + JAW Server Wallet ---

  [1] Create new wallet
  [2] Load existing wallet

  Choice: 1

  Creating new server wallet...
  Wallet ID: <privy-wallet-id>
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

**Privy Server Wallets** — Privy manages the private key on its infrastructure. Your server interacts with the wallet through their API, and you never handle raw key material.

**`createViemAccount`** — Bridges a Privy server wallet into a viem-compatible `LocalAccount`, which JAW can then wrap into a smart account.

**`Account.fromLocalAccount`** — The JAW server-side entry point. Takes any viem `LocalAccount` (whether from a private key, Privy, or another KMS) and creates a smart account.
