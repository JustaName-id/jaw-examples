"use client";

import { useAccount } from "@/app/providers";
import { PermissionsPanel } from "@/components/permissions-panel";

export default function PermissionsPage() {
  const { account } = useAccount();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Permissions (ERC-7715)</h2>
        <p className="mt-1 text-sm text-gray-400">
          Grant, query, and revoke delegated permissions for session keys,
          subscriptions, and AI agent wallets.
        </p>
      </div>

      {account ? (
        <PermissionsPanel />
      ) : (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-500">
          Connect your account first to manage permissions.
        </div>
      )}
    </div>
  );
}
