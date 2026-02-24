"use client";

import { useState } from "react";
import { jaw } from "@/lib/jaw";
import type { Plan } from "@/lib/constants";

interface SubscriptionManagerProps {
  permissionId: string;
  plan: Plan;
  onCancelled: () => void;
}

export function SubscriptionManager({
  permissionId,
  plan,
  onCancelled,
}: SubscriptionManagerProps) {
  const [isCharging, setIsCharging] = useState(false);
  const [chargeResult, setChargeResult] = useState<string | null>(null);
  const [chargeError, setChargeError] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  async function handleCharge() {
    setIsCharging(true);
    setChargeResult(null);
    setChargeError(null);

    try {
      const response = await fetch("/api/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permissionId,
          amount: plan.price,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Charge failed");
      }

      setChargeResult(data.transactionId);
    } catch (error) {
      setChargeError(
        error instanceof Error ? error.message : "Charge failed"
      );
    } finally {
      setIsCharging(false);
    }
  }

  async function handleCancel() {
    setIsRevoking(true);
    try {
      await jaw.provider.request({
        method: "wallet_revokePermissions",
        params: [{ id: permissionId as `0x${string}` }],
      });
      onCancelled();
    } finally {
      setIsRevoking(false);
    }
  }

  return (
    <div className="w-full max-w-lg">
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Active Subscription</h2>
          <span className="rounded-full bg-green-900/50 px-3 py-1 text-xs font-medium text-green-400">
            Active
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Plan</span>
            <span className="font-medium">{plan.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Amount</span>
            <span className="font-medium">${plan.price} USDC / month</span>
          </div>
          <div>
            <span className="text-gray-400">Permission ID</span>
            <p className="mt-1 rounded-lg bg-gray-800 px-3 py-2 font-mono text-xs break-all">
              {permissionId}
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-800 pt-6">
          <p className="mb-3 text-sm text-gray-400">
            In production, charges happen automatically on a schedule. For this
            demo, use the button below to trigger a charge manually.
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleCharge}
              disabled={isCharging}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {isCharging ? "Charging..." : `Charge $${plan.price}`}
            </button>

            <button
              onClick={handleCancel}
              disabled={isRevoking}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {isRevoking ? "Cancelling..." : "Cancel"}
            </button>
          </div>
        </div>

        {chargeResult && (
          <div className="mt-4 rounded-lg border border-green-800 bg-green-900/20 p-4">
            <p className="text-sm font-medium text-green-400">
              Charge successful
            </p>
            <p className="mt-1 font-mono text-xs text-green-300/70 break-all">
              Transaction: {chargeResult}
            </p>
          </div>
        )}

        {chargeError && (
          <div className="mt-4 rounded-lg border border-red-800 bg-red-900/20 p-4">
            <p className="text-sm font-medium text-red-400">Charge failed</p>
            <p className="mt-1 text-xs text-red-300/70">{chargeError}</p>
          </div>
        )}
      </div>
    </div>
  );
}
