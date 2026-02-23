"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@/components/connect-button";
import { GrantPermission } from "@/components/grant-permission";
import { PermissionsList } from "@/components/permissions-list";

export default function PermissionsPage() {
  const { isConnected } = useAccount();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center gap-8 p-8 pt-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Permissions</h1>
        <p className="mt-2 text-gray-400">
          Grant, list, and revoke permissions for your passkey smart account
        </p>
      </div>

      <ConnectButton />

      {isConnected && (
        <div className="flex w-full flex-col gap-8">
          <GrantPermission />
          <PermissionsList />
        </div>
      )}
    </main>
  );
}
