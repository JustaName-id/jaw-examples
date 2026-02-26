"use client";

import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { useConnect, useDisconnect } from "@jaw.id/wagmi";
import { config } from "@/lib/config";

export function SignInButton() {
  const { isConnected } = useAccount();
  const { mutate: connect, isPending: isConnecting } = useConnect();
  const { mutate: disconnect, mutateAsync: disconnectAsync, isPending: isDisconnecting } = useDisconnect();
  const [verifiedAddress, setVerifiedAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = useCallback(async () => {
    setError(null);

    // Clear any existing JAW session so wallet_connect goes through the
    // unauthenticated path and shows the popup with the SIWE request.
    // If skipped, a cached session returns cached capabilities (no SIWE data).
    if (isConnected) {
      try { await disconnectAsync({}); } catch { /* ignore */ }
    }

    let nonce: string;
    try {
      const res = await fetch("/api/siwe/nonce");
      const data = await res.json();
      nonce = data.nonce;
    } catch {
      setError("Failed to fetch nonce from server.");
      return;
    }

    connect(
      {
        connector: config.connectors[0],
        capabilities: {
          signInWithEthereum: {
            nonce,
            chainId: "0x14a34",
            domain: window.location.host,
            uri: window.location.origin,
            statement: "Sign in to JAW SIWE Demo",
            expirationTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          },
        },
      },
      {
        onSuccess: async (data) => {
          const siweResponse =
            data.accounts[0].capabilities?.signInWithEthereum;

          if (siweResponse && "message" in siweResponse) {
            try {
              const verifyRes = await fetch("/api/siwe/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  message: siweResponse.message,
                  signature: siweResponse.signature,
                }),
              });

              if (!verifyRes.ok) {
                setError("Server rejected the signature.");
                return;
              }

              const { address: verified } = await verifyRes.json();
              setVerifiedAddress(verified);
            } catch {
              setError("Verification request failed.");
            }
          } else {
            setError("SIWE response missing from wallet.");
          }
        },
        onError: (err) => {
          setError(err.message || "Connection failed.");
        },
      }
    );
  }, [connect, disconnectAsync, isConnected]);

  const handleSignOut = useCallback(() => {
    fetch("/api/siwe/logout", { method: "POST" }).then(() => {
      setVerifiedAddress(null);
      setError(null);
      disconnect({});
    });
  }, [disconnect]);

  if (verifiedAddress) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-green-800/50 bg-green-950/30 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wider text-green-400">
            Authenticated
          </p>
          <p className="mt-1.5 font-mono text-sm break-all text-white">
            {verifiedAddress}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          disabled={isDisconnecting}
          className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {isDisconnecting ? "Signing out..." : "Sign Out"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div className="rounded-lg border border-red-800/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      <button
        onClick={handleSignIn}
        disabled={isConnecting}
        className="w-full rounded-lg bg-blue-600 px-8 py-3 text-sm font-medium transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {isConnecting ? "Signing in..." : "Sign In With Ethereum"}
      </button>
    </div>
  );
}
