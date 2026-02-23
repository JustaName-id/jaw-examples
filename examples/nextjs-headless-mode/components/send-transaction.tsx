"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useAccount } from "@/app/providers";
import {
  DUMMY_RECIPIENT,
  getPaymasterUrl,
  PAYMASTER_CONTEXT,
} from "@/lib/constants";

interface BatchCall {
  to: string;
  value: string;
}

export function SendTransaction() {
  const { account } = useAccount();

  // Single tx state
  const [recipient, setRecipient] = useState(DUMMY_RECIPIENT);
  const [amount, setAmount] = useState("0.0001");
  const [txHash, setTxHash] = useState<string | null>(null);

  // Batch state
  const [batchCalls, setBatchCalls] = useState<BatchCall[]>([
    { to: DUMMY_RECIPIENT, value: "0.0001" },
  ]);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [batchStatus, setBatchStatus] = useState<string | null>(null);

  // Gas estimation
  const [gasEstimate, setGasEstimate] = useState<string | null>(null);

  // USDC gas toggle
  const [payWithUsdc, setPayWithUsdc] = useState(false);

  // Shared state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!account) return null;

  const paymasterUrl = payWithUsdc ? getPaymasterUrl() : undefined;
  const paymasterContext = payWithUsdc ? PAYMASTER_CONTEXT : undefined;

  const handleSendTransaction = async () => {
    setIsLoading(true);
    setError(null);
    setTxHash(null);
    try {
      const hash = await account.sendTransaction(
        [{ to: recipient as `0x${string}`, value: parseEther(amount) }],
        paymasterUrl,
        paymasterContext,
      );
      setTxHash(hash);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transaction failed");
    } finally {
      setIsLoading(false);
    }
  };

  const addBatchCall = () => {
    setBatchCalls([...batchCalls, { to: DUMMY_RECIPIENT, value: "0.0001" }]);
  };

  const removeBatchCall = (index: number) => {
    if (batchCalls.length <= 1) return;
    setBatchCalls(batchCalls.filter((_, i) => i !== index));
  };

  const updateBatchCall = (
    index: number,
    field: keyof BatchCall,
    value: string
  ) => {
    const updated = [...batchCalls];
    updated[index] = { ...updated[index], [field]: value };
    setBatchCalls(updated);
  };

  const handleBatchCalls = async () => {
    setIsLoading(true);
    setError(null);
    setBatchId(null);
    setBatchStatus(null);
    try {
      const calls = batchCalls.map((c) => ({
        to: c.to as `0x${string}`,
        value: parseEther(c.value),
      }));
      const { id } = await account.sendCalls(
        calls,
        undefined,
        paymasterUrl,
        paymasterContext,
      );
      setBatchId(id);

      const poll = setInterval(() => {
        const status = account.getCallStatus(id);
        if (status) {
          setBatchStatus(
            status.status === 200
              ? "Completed"
              : status.status === 100
                ? "Pending"
                : status.status === 400
                  ? "Failed"
                  : status.status === 500
                    ? "Reverted"
                    : `Unknown (${status.status})`
          );
          if (status.status !== 100) clearInterval(poll);
        }
      }, 2000);

      setTimeout(() => clearInterval(poll), 60000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Batch calls failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEstimateGas = async () => {
    setIsLoading(true);
    setError(null);
    setGasEstimate(null);
    try {
      const gas = await account.estimateGas([
        { to: recipient as `0x${string}`, value: parseEther(amount) },
      ]);
      setGasEstimate(gas.toString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gas estimation failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* USDC Gas Toggle */}
      <div className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4">
        <button
          type="button"
          role="switch"
          aria-checked={payWithUsdc}
          onClick={() => setPayWithUsdc(!payWithUsdc)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            payWithUsdc ? "bg-blue-600" : "bg-gray-700"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
              payWithUsdc ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <div>
          <span className="text-sm font-medium">Pay gas with USDC</span>
          <p className="text-xs text-gray-500">
            {payWithUsdc
              ? "Gas fees will be paid in USDC via ERC-20 paymaster"
              : "Gas fees will be paid in native ETH"}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/50 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Single Transaction */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="mb-4 text-base font-semibold">Single Transaction</h3>
        <div className="mb-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-400">
              Recipient
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 font-mono text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">
              Amount (ETH)
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 font-mono text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSendTransaction}
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Send Transaction"}
          </button>
          <button
            onClick={handleEstimateGas}
            disabled={isLoading}
            className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {isLoading ? "Estimating..." : "Estimate Gas"}
          </button>
        </div>

        {txHash && (
          <div className="mt-4 rounded-lg bg-gray-800 p-3 text-sm">
            <span className="text-gray-400">Tx Hash: </span>
            <code className="break-all font-mono text-emerald-400">
              {txHash}
            </code>
          </div>
        )}

        {gasEstimate && (
          <div className="mt-2 rounded-lg bg-gray-800 p-3 text-sm">
            <span className="text-gray-400">Gas Estimate: </span>
            <code className="font-mono text-yellow-400">{gasEstimate}</code>
          </div>
        )}
      </div>

      {/* Batch Transactions */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">Batch Transactions</h3>
          <button
            onClick={addBatchCall}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-700 text-lg font-bold transition-colors hover:bg-gray-600"
            title="Add call"
          >
            +
          </button>
        </div>

        <div className="mb-4 space-y-3">
          {batchCalls.map((call, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-700 bg-gray-800 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">
                  Call #{index + 1}
                </span>
                {batchCalls.length > 1 && (
                  <button
                    onClick={() => removeBatchCall(index)}
                    className="text-xs text-red-400 transition-colors hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={call.to}
                  onChange={(e) =>
                    updateBatchCall(index, "to", e.target.value)
                  }
                  placeholder="Recipient address"
                  className="w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-1.5 font-mono text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={call.value}
                  onChange={(e) =>
                    updateBatchCall(index, "value", e.target.value)
                  }
                  placeholder="Amount (ETH)"
                  className="w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-1.5 font-mono text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleBatchCalls}
          disabled={isLoading}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-purple-700 disabled:opacity-50"
        >
          {isLoading
            ? "Sending..."
            : `Send Batch (${batchCalls.length} call${batchCalls.length > 1 ? "s" : ""})`}
        </button>

        {batchId && (
          <div className="mt-4 rounded-lg bg-gray-800 p-3 text-sm">
            <span className="text-gray-400">Batch ID: </span>
            <code className="break-all font-mono text-blue-400">{batchId}</code>
            {batchStatus && (
              <div className="mt-1">
                <span className="text-gray-400">Status: </span>
                <span
                  className={
                    batchStatus === "Completed"
                      ? "text-emerald-400"
                      : batchStatus === "Pending"
                        ? "text-yellow-400"
                        : "text-red-400"
                  }
                >
                  {batchStatus}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
