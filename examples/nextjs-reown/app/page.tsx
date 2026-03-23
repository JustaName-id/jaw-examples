"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { JawConnectButton } from "@/components/connect-button";
import { SignMessage } from "@/components/sign-message";
import { SignTypedData } from "@/components/sign-typed-data";
import { SendTransaction } from "@/components/send-transaction";

export default function Home() {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-2xl flex-col items-center gap-10 py-16 px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            JAW + Reown AppKit
          </h1>
          <p className="text-base text-zinc-500 dark:text-zinc-400">
            Connect with a JAW passkey smart account or any wallet via Reown.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 w-full">
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Passkey Smart Account
            </p>
            <JawConnectButton />
          </div>

          <div className="flex items-center gap-4 w-full">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            <span className="text-xs text-zinc-400">or</span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Any Wallet
            </p>
            <appkit-button />
          </div>
        </div>

        {mounted && isConnected && (
          <div className="flex w-full flex-col gap-8 pt-4">
            <div className="flex items-center gap-4 w-full">
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Actions
              </span>
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            </div>

            <SignMessage />
            <SignTypedData />
            <SendTransaction />
          </div>
        )}
      </main>
    </div>
  );
}
