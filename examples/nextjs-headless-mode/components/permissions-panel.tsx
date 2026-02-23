"use client";

import { useState } from "react";
import { parseUnits, parseEther } from "viem";
import { useAccount } from "@/app/providers";
import { USDC_ADDRESS } from "@/lib/constants";

const NATIVE_TOKEN =
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as const; // ERC-7528

const SPEND_UNITS = [
  "minute",
  "hour",
  "day",
  "week",
  "month",
  "year",
  "forever",
] as const;

type SpendUnit = (typeof SPEND_UNITS)[number];

interface CallPermission {
  target: string;
  functionSignature: string;
}

interface SpendPermission {
  token: "usdc" | "native";
  allowance: string;
  unit: SpendUnit;
}

export function PermissionsPanel() {
  const { account } = useAccount();

  // Grant state
  const [spender, setSpender] = useState("");
  const [durationDays, setDurationDays] = useState("30");
  const [calls, setCalls] = useState<CallPermission[]>([
    { target: USDC_ADDRESS, functionSignature: "transfer(address,uint256)" },
  ]);
  const [spends, setSpends] = useState<SpendPermission[]>([
    { token: "usdc", allowance: "100", unit: "month" },
  ]);

  // Granted permissions
  const [grantedPermissions, setGrantedPermissions] = useState<
    { id: string; spender: string; expiry: number }[]
  >([]);

  // Query state
  const [queryPermissionId, setQueryPermissionId] = useState("");
  const [permissionDetails, setPermissionDetails] = useState<string | null>(
    null
  );

  // Shared
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!account) return null;

  // --- Call permissions ---
  const addCall = () => {
    setCalls([...calls, { target: "", functionSignature: "" }]);
  };

  const removeCall = (index: number) => {
    if (calls.length <= 1) return;
    setCalls(calls.filter((_, i) => i !== index));
  };

  const updateCall = (
    index: number,
    field: keyof CallPermission,
    value: string
  ) => {
    const updated = [...calls];
    updated[index] = { ...updated[index], [field]: value };
    setCalls(updated);
  };

  // --- Spend permissions ---
  const addSpend = () => {
    setSpends([...spends, { token: "usdc", allowance: "10", unit: "month" }]);
  };

  const removeSpend = (index: number) => {
    if (spends.length <= 1) return;
    setSpends(spends.filter((_, i) => i !== index));
  };

  const updateSpend = (
    index: number,
    field: keyof SpendPermission,
    value: string
  ) => {
    const updated = [...spends];
    updated[index] = { ...updated[index], [field]: value } as SpendPermission;
    setSpends(updated);
  };

  // --- Handlers ---
  const handleGrant = async () => {
    if (!spender.trim()) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const expiry =
        Math.floor(Date.now() / 1000) + Number(durationDays) * 86400;

      const callPermissions = calls
        .filter((c) => c.target && c.functionSignature)
        .map((c) => ({
          target: c.target as `0x${string}`,
          functionSignature: c.functionSignature,
        }));

      const spendPermissions = spends.map((s) => ({
        token: (s.token === "native"
          ? NATIVE_TOKEN
          : USDC_ADDRESS) as `0x${string}`,
        allowance:
          s.token === "native"
            ? parseEther(s.allowance).toString()
            : parseUnits(s.allowance, 6).toString(),
        unit: s.unit,
      }));

      const result = await account.grantPermissions(
        expiry,
        spender as `0x${string}`,
        {
          calls: callPermissions,
          spends: spendPermissions,
        }
      );

      setGrantedPermissions((prev) => [
        { id: result.permissionId, spender, expiry },
        ...prev,
      ]);
      setSuccess("Permission granted successfully");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to grant permission"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetPermission = async (id?: string) => {
    const targetId = id || queryPermissionId;
    if (!targetId.trim()) return;
    setIsLoading(true);
    setError(null);
    setPermissionDetails(null);
    try {
      const permission = await account.getPermission(
        targetId as `0x${string}`
      );
      setPermissionDetails(JSON.stringify(permission, null, 2));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to get permission"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (permissionId: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await account.revokePermission(permissionId as `0x${string}`);
      setGrantedPermissions((prev) =>
        prev.filter((p) => p.id !== permissionId)
      );
      setSuccess("Permission revoked successfully");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to revoke permission"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-900/50 p-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-emerald-900/50 p-3 text-sm text-emerald-300">
          {success}
        </div>
      )}

      {/* Grant Permission */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="mb-4 text-base font-semibold">Grant Permission</h3>

        {/* Spender + Duration */}
        <div className="mb-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-400">
              Spender Address
            </label>
            <input
              type="text"
              value={spender}
              onChange={(e) => setSpender(e.target.value)}
              placeholder="0x..."
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 font-mono text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">
              Duration (days)
            </label>
            <input
              type="text"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 font-mono text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Call Permissions */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Allowed Calls
            </p>
            <button
              onClick={addCall}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-700 text-sm font-bold transition-colors hover:bg-gray-600"
              title="Add call permission"
            >
              +
            </button>
          </div>
          <div className="space-y-2">
            {calls.map((call, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-700 bg-gray-800 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Call #{index + 1}
                  </span>
                  {calls.length > 1 && (
                    <button
                      onClick={() => removeCall(index)}
                      className="text-xs text-red-400 transition-colors hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={call.target}
                    onChange={(e) =>
                      updateCall(index, "target", e.target.value)
                    }
                    placeholder="Contract address (0x...)"
                    className="w-full rounded-lg border border-gray-600 bg-gray-900 px-2 py-1.5 font-mono text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={call.functionSignature}
                    onChange={(e) =>
                      updateCall(index, "functionSignature", e.target.value)
                    }
                    placeholder="e.g. transfer(address,uint256)"
                    className="w-full rounded-lg border border-gray-600 bg-gray-900 px-2 py-1.5 font-mono text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spend Limits */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Spend Limits
            </p>
            <button
              onClick={addSpend}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-700 text-sm font-bold transition-colors hover:bg-gray-600"
              title="Add spend limit"
            >
              +
            </button>
          </div>
          <div className="space-y-2">
            {spends.map((spend, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-700 bg-gray-800 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Spend #{index + 1}
                  </span>
                  {spends.length > 1 && (
                    <button
                      onClick={() => removeSpend(index)}
                      className="text-xs text-red-400 transition-colors hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={spend.token}
                    onChange={(e) =>
                      updateSpend(index, "token", e.target.value)
                    }
                    className="rounded-lg border border-gray-600 bg-gray-900 px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="usdc">USDC</option>
                    <option value="native">Native ETH</option>
                  </select>
                  <input
                    type="text"
                    value={spend.allowance}
                    onChange={(e) =>
                      updateSpend(index, "allowance", e.target.value)
                    }
                    placeholder={spend.token === "native" ? "0.1" : "100"}
                    className="rounded-lg border border-gray-600 bg-gray-900 px-2 py-1.5 font-mono text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                  <select
                    value={spend.unit}
                    onChange={(e) =>
                      updateSpend(index, "unit", e.target.value)
                    }
                    className="rounded-lg border border-gray-600 bg-gray-900 px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    {SPEND_UNITS.map((u) => (
                      <option key={u} value={u}>
                        per {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleGrant}
          disabled={isLoading || !spender.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Granting..." : "Grant Permission"}
        </button>
      </div>

      {/* Granted Permissions List */}
      {grantedPermissions.length > 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="mb-4 text-base font-semibold">
            Granted Permissions
          </h3>
          <div className="space-y-2">
            {grantedPermissions.map((perm) => (
              <div
                key={perm.id}
                className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-xs text-emerald-400">
                    {perm.id}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Spender: {perm.spender.slice(0, 10)}...{" · "}Expires:{" "}
                    {new Date(perm.expiry * 1000).toLocaleDateString()}
                  </p>
                </div>
                <div className="ml-3 flex shrink-0 gap-2">
                  <button
                    onClick={() => handleGetPermission(perm.id)}
                    disabled={isLoading}
                    className="rounded-lg bg-gray-700 px-3 py-1 text-xs font-medium transition-colors hover:bg-gray-600 disabled:opacity-50"
                  >
                    Query
                  </button>
                  <button
                    onClick={() => handleRevoke(perm.id)}
                    disabled={isLoading}
                    className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium transition-colors hover:bg-red-700 disabled:opacity-50"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Query Permission */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="mb-4 text-base font-semibold">Query Permission</h3>
        <div className="mb-4">
          <label className="mb-1 block text-sm text-gray-400">
            Permission ID
          </label>
          <input
            type="text"
            value={queryPermissionId}
            onChange={(e) => setQueryPermissionId(e.target.value)}
            placeholder="0x..."
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 font-mono text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <button
          onClick={() => handleGetPermission()}
          disabled={isLoading || !queryPermissionId.trim()}
          className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-600 disabled:opacity-50"
        >
          {isLoading ? "Querying..." : "Get Permission Details"}
        </button>

        {permissionDetails && (
          <div className="mt-4 rounded-lg bg-gray-800 p-3 text-sm">
            <span className="mb-1 block text-gray-400">
              Permission Details:
            </span>
            <pre className="overflow-x-auto font-mono text-xs text-blue-400">
              {permissionDetails}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
