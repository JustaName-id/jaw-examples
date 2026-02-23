## ENS Identity

ENS subname issuance and profile resolution using JAW and the JustaName SDK.

### ENS configuration

You MUST configure your ENS domain in the JAW Dashboard (dashboard.jaw.id) before adding it to your SDK config. The dashboard registers your domain for subname issuance -- without this step, subname creation will fail silently.

```typescript
import { jaw } from '@jaw.id/wagmi';

const connector = jaw({
  apiKey: 'your-api-key',
  ens: 'myapp.eth', // Must be registered in JAW Dashboard first
});
```

Or with core provider:

```typescript
import { JAW } from '@jaw.id/core';

const jaw = JAW.create({
  apiKey: 'your-api-key',
  ens: 'myapp.eth',
});
```

### Subname issuance during connect

When `ens` is configured, new users are automatically prompted to claim a subname during account creation (e.g., `alice.myapp.eth`). Returning users who already have a subname skip this step.

You MUST NOT expect subname prompts for existing accounts -- subnames are only issued when a user creates a new account.

### Attaching text records during connect

You MUST use the `subnameTextRecords` capability inside `wallet_connect` (or `useConnect` from `@jaw.id/wagmi`) to attach text records to the user's subname during connection. Text records are only attached if `ens` is configured and the user creates a new account.

```tsx
import { useConnect } from '@jaw.id/wagmi';
import { config } from './config';

function ConnectWithProfile() {
  const { mutate: connect } = useConnect();

  const handleConnect = () => {
    connect({
      connector: config.connectors[0],
      capabilities: {
        subnameTextRecords: [
          { key: 'avatar', value: 'https://myapp.com/avatars/default.png' },
          { key: 'description', value: 'A myapp.eth user' },
          { key: 'url', value: 'https://myapp.com' },
          { key: 'com.twitter', value: '@myapp' },
        ],
      },
    });
  };

  return <button onClick={handleConnect}>Connect & Claim Subname</button>;
}
```

### Profile resolution (JustaName SDK)

Profile resolution uses a separate package, `@justaname.id/sdk`. You MUST install it independently from the JAW SDK.

```bash
npm install @justaname.id/sdk
```

#### Initialize the JustaName SDK

```typescript
import { JustaName } from '@justaname.id/sdk';

const justaName = JustaName.init({
  networks: [{
    chainId: 1,
    providerUrl: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
  }],
});
```

#### Resolve by ENS name

```typescript
const profile = await justaName.subnames.getRecords({
  ens: 'alice.myapp.eth',
});

console.log(profile.records.texts);  // [{ key: 'avatar', value: '...' }, ...]
console.log(profile.records.coins);  // [{ id: 60, name: 'ETH', value: '0x...' }]
```

#### Reverse resolve by address

```typescript
const result = await justaName.subnames.reverseResolve({
  address: '0x1234...abcd',
  chainId: 1,
});

console.log(result.ens); // 'alice.myapp.eth'
```

### Key rules

- You MUST configure the ENS domain in the JAW Dashboard before adding `ens` to your SDK config -- the dashboard registers the domain for subname issuance.
- You MUST use `subnameTextRecords` inside `wallet_connect` (or `useConnect` capabilities) to attach text records -- there is no separate method.
- You MUST install `@justaname.id/sdk` separately for profile resolution -- it is NOT included in `@jaw.id/core` or `@jaw.id/wagmi`.
- You MUST NOT expect subname prompts for returning users -- subnames are only issued during new account creation.
- You MUST NOT use `eth_requestAccounts` when requesting subname capabilities -- use `wallet_connect` (or `useConnect` from `@jaw.id/wagmi`) instead.
- You MUST NOT request `subnameTextRecords` on a connector that lacks `ens` configuration -- text records require an ENS domain to be set.
- Text records are only attached if `ens` is configured AND the user creates a new account during the connection flow.

### Common mistakes

Do NOT try to issue subnames without dashboard setup:

```typescript
// Wrong -- ens domain not registered in dashboard, will fail
jaw({ apiKey: 'key', ens: 'unregistered.eth' })
```

Do NOT confuse the JustaName SDK with the JAW SDK:

```typescript
// Wrong -- getRecords is not on the JAW SDK
import { JAW } from '@jaw.id/core';
const jaw = JAW.create({ apiKey: 'key' });
jaw.getRecords({ ens: 'alice.myapp.eth' }); // Does not exist

// Correct -- use @justaname.id/sdk for resolution
import { JustaName } from '@justaname.id/sdk';
const justaName = JustaName.init({ networks: [{ chainId: 1, providerUrl: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY' }] });
const profile = await justaName.subnames.getRecords({ ens: 'alice.myapp.eth' });
```
