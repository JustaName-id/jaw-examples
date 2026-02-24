"use client";

import { usePermissions, useRevokePermissions } from "@jaw.id/wagmi";

export function PermissionsList() {
  const { data: permissions, isLoading, refetch } = usePermissions();
  const { mutate: revokePermission, isPending: isRevoking } =
    useRevokePermissions();

  function handleRevoke(id: string) {
    revokePermission(
      { id: id as `0x${string}` },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  }

  function formatExpiry(timestamp: number) {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function truncateAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return (
    <div className="w-full rounded-xl border border-gray-800 bg-gray-900 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Active Permissions</h2>
          <p className="mt-1 text-sm text-gray-400">
            Manage permissions you have granted.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:border-gray-600 hover:text-white disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      <div className="mt-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
          </div>
        ) : !permissions || permissions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-700 py-12 text-center">
            <p className="text-sm text-gray-500">
              No active permissions found.
            </p>
            <p className="mt-1 text-xs text-gray-600">
              Grant a permission above to get started.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {permissions.map((permission) => (
              <li
                key={permission.id}
                className="rounded-lg border border-gray-800 bg-gray-800/50 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {/* Permission ID */}
                    <p className="font-mono text-xs text-gray-500 break-all">
                      {permission.id}
                    </p>

                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {/* Spender */}
                      <div>
                        <p className="text-xs text-gray-500">Spender</p>
                        <p
                          className="mt-0.5 font-mono text-sm"
                          title={permission.spender}
                        >
                          {truncateAddress(permission.spender)}
                        </p>
                      </div>

                      {/* Allowance */}
                      {permission.permissions?.spends?.[0] && (
                        <div>
                          <p className="text-xs text-gray-500">Allowance</p>
                          <p className="mt-0.5 text-sm">
                            {permission.permissions.spends[0].allowance} /{" "}
                            {permission.permissions.spends[0].unit}
                          </p>
                        </div>
                      )}

                      {/* Expiry */}
                      <div>
                        <p className="text-xs text-gray-500">Expires</p>
                        <p className="mt-0.5 text-sm">
                          {formatExpiry(permission.end)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Revoke button */}
                  <button
                    onClick={() => handleRevoke(permission.id)}
                    disabled={isRevoking}
                    className="shrink-0 rounded-lg border border-red-800 bg-red-900/20 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-900/40 disabled:opacity-50"
                  >
                    {isRevoking ? "Revoking..." : "Revoke"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
