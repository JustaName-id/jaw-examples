"use client";

import { useState, useEffect } from "react";
import { Account, type PasskeyAccount } from "@jaw.id/core";
import { useAccount } from "@/app/providers";
import { getAccountConfig } from "@/lib/constants";

export function AccountPanel() {
  const { account, setAccount, logout } = useAccount();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storedAccounts, setStoredAccounts] = useState<PasskeyAccount[]>([]);

  const config = getAccountConfig();
  const apiKey = process.env.NEXT_PUBLIC_JAW_API_KEY!;

  useEffect(() => {
    try {
      const accounts = Account.getStoredAccounts(apiKey);
      setStoredAccounts(accounts ?? []);
    } catch {
      // No stored accounts
    }
  }, [apiKey, account]);

  const handleCreate = async () => {
    if (!username.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const acc = await Account.create(config, { username: username.trim() });
      setAccount(acc);
      setUsername("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWith = async (credentialId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const acc = await Account.get(config, credentialId);
      setAccount(acc);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const acc = await Account.import(config);
      setAccount(acc);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to import account");
    } finally {
      setIsLoading(false);
    }
  };

  if (account) {
    const metadata = account.getMetadata();
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Connected</h3>
          <button
            onClick={logout}
            className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-400">Address: </span>
            <code className="break-all font-mono text-emerald-400">
              {account.address}
            </code>
          </div>
          <div>
            <span className="text-gray-400">Chain ID: </span>
            <code className="font-mono">{account.chainId}</code>
          </div>
          {metadata && (
            <>
              <div>
                <span className="text-gray-400">Username: </span>
                <code className="font-mono">{metadata.username}</code>
              </div>
              <div>
                <span className="text-gray-400">Credential ID: </span>
                <code className="break-all font-mono text-xs text-gray-500">
                  {metadata.credentialId}
                </code>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-900/50 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Stored accounts list */}
      {storedAccounts.length > 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="mb-3 text-base font-semibold">Your Accounts</h3>
          <div className="space-y-2">
            {storedAccounts.map((stored) => (
              <button
                key={stored.credentialId}
                onClick={() => handleLoginWith(stored.credentialId)}
                disabled={isLoading}
                className="flex w-full items-center justify-between rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-left transition-colors hover:border-gray-600 hover:bg-gray-800 disabled:opacity-50"
              >
                <div className="min-w-0 flex-1">
                  {stored.username && (
                    <p className="text-sm font-medium">{stored.username}</p>
                  )}
                  <p className="truncate font-mono text-xs text-gray-400">
                    {stored.credentialId}
                  </p>
                </div>
                <span className="ml-3 shrink-0 text-xs text-gray-500">
                  Login →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create new account */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="mb-3 text-base font-semibold">Create New Account</h3>
        <div className="mb-4">
          <label className="mb-1 block text-sm text-gray-400">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="alice"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button
          onClick={handleCreate}
          disabled={isLoading || !username.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Creating..." : "Create Account"}
        </button>
      </div>

      {/* Import existing passkey */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="mb-2 text-base font-semibold">Import Passkey</h3>
        <p className="mb-3 text-sm text-gray-400">
          Import an existing passkey-based smart account.
        </p>
        <button
          onClick={handleImport}
          disabled={isLoading}
          className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-800 disabled:opacity-50"
        >
          {isLoading ? "Importing..." : "Import Passkey"}
        </button>
      </div>
    </div>
  );
}
