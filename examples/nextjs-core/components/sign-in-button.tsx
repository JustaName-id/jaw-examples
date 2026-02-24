"use client";

import { useState, useCallback } from "react";
import { jaw } from "@/lib/jaw";
import { useJaw } from "@/app/providers";

interface SiweCapabilityResponse {
  message?: string;
  signature?: string;
}

interface WalletConnectResult {
  accounts: Array<{
    address: string;
    capabilities?: {
      signInWithEthereum?: SiweCapabilityResponse;
    };
  }>;
}

export function SignInButton() {
  const { isConnected } = useJaw();
  const [verifiedAddress, setVerifiedAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = useCallback(async () => {
    setError(null);
    setIsConnecting(true);

    try {
      const nonceRes = await fetch("/api/siwe/nonce");
      const { nonce } = await nonceRes.json();

      // wallet_connect with SIWE capability — must use wallet_connect, not eth_requestAccounts
      const result = await jaw.provider.request({
        method: "wallet_connect",
        params: [{
          capabilities: {
            signInWithEthereum: {
              nonce,
              chainId: "0x1",
              domain: window.location.host,
              uri: window.location.origin,
              statement: "Sign in to JAW SIWE Demo",
              expirationTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            },
          },
        }],
      }) as WalletConnectResult;

      const siweResponse = result.accounts[0].capabilities?.signInWithEthereum;

      if (siweResponse && "message" in siweResponse) {
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
      } else {
        setError("SIWE response missing from wallet.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed.");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setIsDisconnecting(true);
    try {
      await fetch("/api/siwe/logout", { method: "POST" });
      setVerifiedAddress(null);
      setError(null);
      await jaw.provider.request({ method: "wallet_disconnect" });
    } finally {
      setIsDisconnecting(false);
    }
  }, []);

  if (isConnected && verifiedAddress) {
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
