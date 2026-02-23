"use client";

import { AccountPanel } from "@/components/account-panel";

export default function Home() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Account</h2>
        <p className="mt-1 text-sm text-gray-400">
          Create, login, or import a passkey smart account using the headless
          Account API from{" "}
          <code className="rounded bg-gray-800 px-1.5 py-0.5 text-xs">
            @jaw.id/core
          </code>
          .
        </p>
      </div>

      <AccountPanel />
    </div>
  );
}
