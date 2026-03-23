"use client";

import { useState } from "react";
import { useSignMessage } from "wagmi";

export function SignMessage() {
  const [message, setMessage] = useState("Hello from JAW + Reown!");
  const {
    signMessage,
    data: signature,
    isPending,
    error,
    reset,
  } = useSignMessage();

  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Personal Sign
      </h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Sign a plaintext message using personal_sign (EIP-191)
      </p>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter a message to sign..."
        rows={3}
        className="mt-4 w-full resize-none rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:border-blue-600"
      />

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => signMessage({ message })}
          disabled={isPending || !message.trim()}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Signing..." : "Sign Message"}
        </button>
        {(signature || error) && (
          <button
            onClick={() => reset()}
            className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {signature && (
        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Signature
          </p>
          <p className="mt-1 font-mono text-xs break-all text-green-600 dark:text-green-400">
            {signature}
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-xs font-medium text-red-600 dark:text-red-400">
            Error
          </p>
          <p className="mt-1 text-sm text-red-500 dark:text-red-300">
            {error.message}
          </p>
        </div>
      )}
    </div>
  );
}
