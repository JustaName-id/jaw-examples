"use client";

import { useState } from "react";
import { jaw } from "@/lib/jaw";
import { useJaw } from "@/app/providers";

export function ConnectButton() {
  const { address, isConnected } = useJaw();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  async function handleConnect() {
    setIsConnecting(true);
    try {
      await jaw.provider.request({ method: "wallet_connect", params: [{}] });
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleDisconnect() {
    setIsDisconnecting(true);
    try {
      await jaw.provider.request({ method: "wallet_disconnect" });
    } finally {
      setIsDisconnecting(false);
    }
  }

  if (isConnected) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-xl border border-gray-800 bg-gray-900 px-6 py-4">
          <p className="text-sm text-gray-400">Connected as</p>
          <p className="mt-1 font-mono text-sm break-all">{address}</p>
        </div>
        <button
          onClick={handleDisconnect}
          disabled={isDisconnecting}
          className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {isDisconnecting ? "Disconnecting..." : "Disconnect"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-medium transition-colors hover:bg-blue-700 disabled:opacity-50"
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
