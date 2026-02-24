"use client";

import { useState } from "react";
import { useSendCalls } from "wagmi";
import { parseEther, encodeFunctionData } from "viem";
import { baseSepolia } from "wagmi/chains";

// Minimal ERC-20 ABI for the transfer function
const erc20Abi = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export function SendTransaction() {
  return (
    <div className="flex w-full flex-col gap-6">
      <SendEth />
      <BatchSend />
      <Erc20Transfer />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. Send ETH to a single address
// ---------------------------------------------------------------------------
function SendEth() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const { sendCalls, isPending, data, error } = useSendCalls();

  function handleSend() {
    if (!to || !amount) return;
    sendCalls({
      chainId: baseSepolia.id,
      calls: [
        {
          to: to as `0x${string}`,
          value: parseEther(amount),
        },
      ],
    });
  }

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="text-lg font-semibold">Send ETH</h2>
      <p className="mt-1 text-sm text-gray-400">
        Send a single ETH transfer to any address.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <input
          type="text"
          placeholder="Recipient address (0x...)"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-lg border border-gray-800 bg-gray-950 px-4 py-2.5 text-sm placeholder-gray-600 outline-none focus:border-gray-700"
        />
        <input
          type="text"
          placeholder="Amount in ETH (e.g. 0.01)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="rounded-lg border border-gray-800 bg-gray-950 px-4 py-2.5 text-sm placeholder-gray-600 outline-none focus:border-gray-700"
        />
        <button
          onClick={handleSend}
          disabled={isPending || !to || !amount}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Sending..." : "Send ETH"}
        </button>
      </div>

      <TxStatus id={data?.id} error={error} />
    </section>
  );
}

// ---------------------------------------------------------------------------
// 2. Batch Send -- two transfers in a single call
// ---------------------------------------------------------------------------
function BatchSend() {
  const [toA, setToA] = useState("");
  const [amountA, setAmountA] = useState("");
  const [toB, setToB] = useState("");
  const [amountB, setAmountB] = useState("");
  const { sendCalls, isPending, data, error } = useSendCalls();

  function handleBatch() {
    if (!toA || !amountA || !toB || !amountB) return;
    sendCalls({
      chainId: baseSepolia.id,
      calls: [
        {
          to: toA as `0x${string}`,
          value: parseEther(amountA),
        },
        {
          to: toB as `0x${string}`,
          value: parseEther(amountB),
        },
      ],
    });
  }

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="text-lg font-semibold">Batch Send</h2>
      <p className="mt-1 text-sm text-gray-400">
        Send ETH to two addresses in a single batched call.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Recipient A
          </p>
          <input
            type="text"
            placeholder="Address (0x...)"
            value={toA}
            onChange={(e) => setToA(e.target.value)}
            className="rounded-lg border border-gray-800 bg-gray-950 px-4 py-2.5 text-sm placeholder-gray-600 outline-none focus:border-gray-700"
          />
          <input
            type="text"
            placeholder="Amount in ETH"
            value={amountA}
            onChange={(e) => setAmountA(e.target.value)}
            className="rounded-lg border border-gray-800 bg-gray-950 px-4 py-2.5 text-sm placeholder-gray-600 outline-none focus:border-gray-700"
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Recipient B
          </p>
          <input
            type="text"
            placeholder="Address (0x...)"
            value={toB}
            onChange={(e) => setToB(e.target.value)}
            className="rounded-lg border border-gray-800 bg-gray-950 px-4 py-2.5 text-sm placeholder-gray-600 outline-none focus:border-gray-700"
          />
          <input
            type="text"
            placeholder="Amount in ETH"
            value={amountB}
            onChange={(e) => setAmountB(e.target.value)}
            className="rounded-lg border border-gray-800 bg-gray-950 px-4 py-2.5 text-sm placeholder-gray-600 outline-none focus:border-gray-700"
          />
        </div>

        <button
          onClick={handleBatch}
          disabled={isPending || !toA || !amountA || !toB || !amountB}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Sending..." : "Batch Send"}
        </button>
      </div>

      <TxStatus id={data?.id} error={error} />
    </section>
  );
}

// ---------------------------------------------------------------------------
// 3. ERC-20 Token Transfer
// ---------------------------------------------------------------------------
function Erc20Transfer() {
  const [token, setToken] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const { sendCalls, isPending, data, error } = useSendCalls();

  function handleTransfer() {
    if (!token || !to || !amount) return;

    const callData = encodeFunctionData({
      abi: erc20Abi,
      functionName: "transfer",
      args: [to as `0x${string}`, BigInt(amount)],
    });

    sendCalls({
      chainId: baseSepolia.id,
      calls: [
        {
          to: token as `0x${string}`,
          data: callData,
        },
      ],
    });
  }

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="text-lg font-semibold">ERC-20 Transfer</h2>
      <p className="mt-1 text-sm text-gray-400">
        Transfer ERC-20 tokens using <code className="text-gray-300">encodeFunctionData</code> from viem.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <input
          type="text"
          placeholder="Token contract address (0x...)"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="rounded-lg border border-gray-800 bg-gray-950 px-4 py-2.5 text-sm placeholder-gray-600 outline-none focus:border-gray-700"
        />
        <input
          type="text"
          placeholder="Recipient address (0x...)"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-lg border border-gray-800 bg-gray-950 px-4 py-2.5 text-sm placeholder-gray-600 outline-none focus:border-gray-700"
        />
        <input
          type="text"
          placeholder="Amount in smallest unit (e.g. 1000000 for 1 USDC)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="rounded-lg border border-gray-800 bg-gray-950 px-4 py-2.5 text-sm placeholder-gray-600 outline-none focus:border-gray-700"
        />
        <button
          onClick={handleTransfer}
          disabled={isPending || !token || !to || !amount}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Sending..." : "Transfer Tokens"}
        </button>
      </div>

      <TxStatus id={data?.id} error={error} />
    </section>
  );
}

// ---------------------------------------------------------------------------
// Shared transaction status display
// ---------------------------------------------------------------------------
function TxStatus({ id, error }: { id?: string; error: Error | null }) {
  if (error) {
    return (
      <div className="mt-4 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3">
        <p className="text-sm font-medium text-red-400">Transaction failed</p>
        <p className="mt-1 text-xs text-red-400/80 break-all">
          {error.message}
        </p>
      </div>
    );
  }

  if (id) {
    return (
      <div className="mt-4 rounded-lg border border-green-900 bg-green-950/50 px-4 py-3">
        <p className="text-sm font-medium text-green-400">
          Transaction submitted
        </p>
        <p className="mt-1 text-xs text-green-400/60">User Op ID</p>
        <p className="mt-0.5 font-mono text-xs text-green-400/80 break-all">
          {id}
        </p>
      </div>
    );
  }

  return null;
}
