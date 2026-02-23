'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { useConnect } from '@jaw.id/wagmi';
import { config } from '@/lib/config';

export function EnsConnectButton() {
  const { address, isConnected } = useAccount();
  const { mutate: connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-400">Connected as</p>
          <p className="font-mono text-sm text-white break-all">{address}</p>
        </div>

        <button
          onClick={() => disconnect()}
          className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
      <p className="text-sm text-gray-400">
        Connect your wallet to claim an ENS subname with pre-configured text
        records. The <code className="text-indigo-400">subnameTextRecords</code>{' '}
        capability sets your avatar, description, and URL on-chain.
      </p>

      <button
        disabled={isConnecting}
        onClick={() =>
          connect({
            connector: config.connectors[0],
            capabilities: {
              subnameTextRecords: [
                {
                  key: 'avatar',
                  value: 'https://ens-profiles.app/avatars/default.png',
                },
                {
                  key: 'description',
                  value: 'New user on JAW ENS Profiles',
                },
                {
                  key: 'url',
                  value: 'https://ens-profiles.app',
                },
              ],
            },
          })
        }
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  );
}
