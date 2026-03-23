"use client";

import { useSignTypedData } from "wagmi";

const typedData = {
  domain: {
    name: "JAW Reown Demo",
    version: "1",
    chainId: 84532,
  },
  types: {
    Mail: [
      { name: "from", type: "Person" },
      { name: "to", type: "Person" },
      { name: "contents", type: "string" },
    ],
    Person: [
      { name: "name", type: "string" },
      { name: "wallet", type: "address" },
    ],
  },
  primaryType: "Mail" as const,
  message: {
    from: {
      name: "Alice",
      wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826" as `0x${string}`,
    },
    to: {
      name: "Bob",
      wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB" as `0x${string}`,
    },
    contents: "Hello Bob!",
  },
} as const;

export function SignTypedData() {
  const {
    signTypedData,
    data: signature,
    isPending,
    error,
    reset,
  } = useSignTypedData();

  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        EIP-712 Typed Data
      </h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Sign structured typed data following the EIP-712 standard
      </p>

      <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Domain
        </p>
        <div className="mt-1 space-y-0.5 font-mono text-xs text-zinc-700 dark:text-zinc-300">
          <p>name: {typedData.domain.name}</p>
          <p>version: {typedData.domain.version}</p>
          <p>chainId: {typedData.domain.chainId}</p>
        </div>

        <p className="mt-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Message (Mail)
        </p>
        <div className="mt-1 space-y-0.5 font-mono text-xs text-zinc-700 dark:text-zinc-300">
          <p>
            from: {typedData.message.from.name} (
            {typedData.message.from.wallet.slice(0, 10)}...)
          </p>
          <p>
            to: {typedData.message.to.name} (
            {typedData.message.to.wallet.slice(0, 10)}...)
          </p>
          <p>contents: {typedData.message.contents}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => signTypedData(typedData)}
          disabled={isPending}
          className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
        >
          {isPending ? "Signing..." : "Sign Typed Data"}
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
