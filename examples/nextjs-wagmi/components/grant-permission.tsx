"use client";

import { useState } from "react";
import { useGrantPermissions } from "@jaw.id/wagmi";
import { useChainId, useSwitchChain } from "wagmi";
import { parseUnits, type Address } from "viem";
import { baseSepolia } from "wagmi/chains";

const USDC_ADDRESS: Address =
  "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // USDC on Base Sepolia

const DURATION_OPTIONS: Record<string, number> = {
  day: 24 * 60 * 60,
  week: 7 * 24 * 60 * 60,
  month: 30 * 24 * 60 * 60,
};

export function GrantPermission() {
  const [spender, setSpender] = useState("");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState<"day" | "week" | "month">("week");
  const [lastPermissionId, setLastPermissionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { mutate: grantPermission, isPending } = useGrantPermissions();

  async function handleGrant() {
    setError(null);
    setLastPermissionId(null);

    if (!spender || !spender.startsWith("0x")) {
      setError("Enter a valid spender address.");
      return;
    }

    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setError("Enter a valid token amount.");
      return;
    }

    if (chainId !== baseSepolia.id) {
      try {
        await switchChainAsync({ chainId: baseSepolia.id });
      } catch {
        setError("Please switch to Base Sepolia to grant permissions.");
        return;
      }
    }

    grantPermission(
      {
        chainId: baseSepolia.id,
        expiry:
          Math.floor(Date.now() / 1000) + DURATION_OPTIONS[duration],
        spender: spender as Address,
        permissions: {
          spends: [
            {
              token: USDC_ADDRESS,
              allowance: parseUnits(amount, 6).toString(),
              unit: duration === "month" ? "day" : duration,
            },
          ],
          calls: [
            {
              target: USDC_ADDRESS,
              functionSignature: "transfer(address,uint256)",
            },
          ],
        },
      },
      {
        onSuccess: (data) => {
          setLastPermissionId(data.permissionId);
          setSpender("");
          setAmount("");
        },
        onError: (err) => {
          setError(err.message ?? "Failed to grant permission.");
        },
      }
    );
  }

  return (
    <div className="w-full rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="text-lg font-semibold">Grant Permission</h2>
      <p className="mt-1 text-sm text-gray-400">
        Authorize a spender to transfer USDC on your behalf.
      </p>

      <div className="mt-5 flex flex-col gap-4">
        {/* Spender address */}
        <div>
          <label
            htmlFor="spender"
            className="mb-1.5 block text-sm font-medium text-gray-300"
          >
            Spender Address
          </label>
          <input
            id="spender"
            type="text"
            placeholder="0x..."
            value={spender}
            onChange={(e) => setSpender(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 font-mono text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Amount */}
        <div>
          <label
            htmlFor="amount"
            className="mb-1.5 block text-sm font-medium text-gray-300"
          >
            USDC Allowance
          </label>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            placeholder="100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">
            Duration
          </label>
          <div className="flex gap-2">
            {(["day", "week", "month"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setDuration(opt)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  duration === opt
                    ? "border-blue-500 bg-blue-600/20 text-blue-400"
                    : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                }`}
              >
                1 {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Grant button */}
        <button
          onClick={handleGrant}
          disabled={isPending}
          className="mt-1 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Granting..." : "Grant Permission"}
        </button>

        {/* Success message */}
        {lastPermissionId && (
          <div className="rounded-lg border border-green-800 bg-green-900/20 px-4 py-3">
            <p className="text-sm font-medium text-green-400">
              Permission granted
            </p>
            <p className="mt-1 font-mono text-xs text-green-300/70 break-all">
              {lastPermissionId}
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="rounded-lg border border-red-800 bg-red-900/20 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
