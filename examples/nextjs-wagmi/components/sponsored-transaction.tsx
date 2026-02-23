"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useSendCalls } from "wagmi";
import { parseEther } from "viem";

export function SponsoredTransaction() {
  const { isConnected, address } = useAccount();
  const { sendCalls, isPending, data: id } = useSendCalls();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("0.0001");

  if (!isConnected) {
    return null;
  }

  const handleSend = () => {
    const to = (recipient || address) as `0x${string}`;

    sendCalls({
      calls: [
        {
          to,
          value: parseEther(amount),
        },
      ],
    });
  };

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Paymaster info callout */}
      <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/30 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
            $
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-300">
              Gas Sponsored
            </p>
            <p className="mt-1 text-sm text-emerald-400/70">
              A paymaster is configured for this app. All transaction gas fees
              are sponsored -- you pay zero gas.
            </p>
          </div>
        </div>
      </div>

      {/* Transaction form */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <h2 className="text-lg font-semibold">Send Transaction</h2>
        <p className="mt-1 text-sm text-gray-400">
          This transaction is gasless. The paymaster covers the fee.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="recipient"
              className="block text-sm font-medium text-gray-300"
            >
              Recipient
            </label>
            <input
              id="recipient"
              type="text"
              placeholder={address ?? "0x..."}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm font-mono placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to send to yourself
            </p>
          </div>

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-300"
            >
              Amount (ETH)
            </label>
            <input
              id="amount"
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm font-mono placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={isPending || !amount}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {isPending ? "Sending..." : "Send Gasless Transaction"}
          </button>

          {id && (
            <div className="rounded-lg border border-gray-800 bg-gray-800/50 px-4 py-3">
              <p className="text-sm text-gray-400">Call Bundle ID</p>
              <p className="mt-1 font-mono text-xs break-all text-gray-300">
                {id}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <h3 className="text-sm font-semibold text-gray-300">How It Works</h3>
        <ol className="mt-3 space-y-2 text-sm text-gray-400">
          <li className="flex gap-2">
            <span className="shrink-0 font-mono text-gray-600">1.</span>
            The JAW connector is configured with a paymaster URL in{" "}
            <code className="text-gray-300">lib/config.ts</code>.
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 font-mono text-gray-600">2.</span>
            When you send a transaction, the paymaster is asked to sponsor the
            gas fees.
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 font-mono text-gray-600">3.</span>
            If approved, the user operation is submitted with zero gas cost to
            the user.
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 font-mono text-gray-600">4.</span>
            No special code is needed in your components -- use{" "}
            <code className="text-gray-300">useSendCalls</code> as normal.
          </li>
        </ol>
      </div>
    </div>
  );
}
