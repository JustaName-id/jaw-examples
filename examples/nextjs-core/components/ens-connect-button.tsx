"use client";

import { useState } from "react";
import { jaw } from "@/lib/jaw";
import { useJaw } from "@/app/providers";

export function EnsConnectButton() {
  const { address, isConnected } = useJaw();
  const [isConnecting, setIsConnecting] = useState(false);

  async function handleConnect() {
    setIsConnecting(true);
    try {
      // wallet_connect with subnameTextRecords capability
      // Text records are attached when the user creates a new account
      await jaw.provider.request({
        method: "wallet_connect",
        params: [{
          capabilities: {
            subnameTextRecords: [
              {
                key: "avatar",
                value: "https://ens-profiles.app/avatars/default.png",
              },
              {
                key: "description",
                value: "New user on JAW ENS Profiles",
              },
              {
                key: "url",
                value: "https://ens-profiles.app",
              },
            ],
          },
        }],
      });
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleDisconnect() {
    await jaw.provider.request({ method: "wallet_disconnect" });
  }

  if (isConnected && address) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-400">Connected as</p>
          <p className="font-mono text-sm text-white break-all">{address}</p>
        </div>

        <button
          onClick={handleDisconnect}
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
        records. The{" "}
        <code className="text-indigo-400">subnameTextRecords</code> capability
        sets your avatar, description, and URL on-chain.
      </p>

      <button
        disabled={isConnecting}
        onClick={handleConnect}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </button>
    </div>
  );
}
