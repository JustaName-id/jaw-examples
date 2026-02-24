"use client";

import { useState } from "react";
import { toHex } from "viem";
import { jaw } from "@/lib/jaw";
import { useJaw } from "@/app/providers";

export function SignMessage() {
  const { address } = useJaw();
  const [message, setMessage] = useState("Hello from JAW!");
  const [signature, setSignature] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function handleSign() {
    if (!message.trim() || !address) return;
    setIsPending(true);
    setError(null);
    setSignature(null);
    try {
      // personal_sign requires the message to be hex-encoded
      const sig = await jaw.provider.request({
        method: "personal_sign",
        params: [toHex(message), address],
      });
      setSignature(sig as string);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Signing failed"));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="w-full rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="text-lg font-semibold">Personal Sign</h2>
      <p className="mt-1 text-sm text-gray-400">
        Sign a plaintext message using personal_sign (EIP-191)
      </p>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter a message to sign..."
        rows={3}
        className="mt-4 w-full resize-none rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-600"
      />

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleSign}
          disabled={isPending || !message.trim()}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Signing..." : "Sign Message"}
        </button>
        {(signature || error) && (
          <button
            onClick={() => { setSignature(null); setError(null); }}
            className="rounded-lg border border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:border-gray-600 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {signature && (
        <div className="mt-4 rounded-lg border border-gray-800 bg-gray-950 p-4">
          <p className="text-xs font-medium text-gray-400">Signature</p>
          <p className="mt-1 font-mono text-xs break-all text-green-400">
            {signature}
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-900 bg-red-950 p-4">
          <p className="text-xs font-medium text-red-400">Error</p>
          <p className="mt-1 text-sm text-red-300">{error.message}</p>
        </div>
      )}
    </div>
  );
}
