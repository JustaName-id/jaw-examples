"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useConnect, useDisconnect } from "@jaw.id/wagmi";
import { config } from "@/config";

export function JawConnectButton() {
  const { address, isConnected } = useAccount();
  const { mutate: connect, isPending: isConnecting } = useConnect();
  const { mutate: disconnect, isPending: isDisconnecting } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (isConnected) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Connected as
          </p>
          <p className="mt-1 font-mono text-sm break-all text-zinc-900 dark:text-zinc-100">
            {address}
          </p>
        </div>
        <button
          onClick={() => disconnect({})}
          disabled={isDisconnecting}
          className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {isDisconnecting ? "Disconnecting..." : "Disconnect"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: config.connectors[0] })}
      disabled={isConnecting}
      className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
    >
      {isConnecting ? "Connecting..." : "Connect with JAW"}
    </button>
  );
}
