"use client";

import { useJaw } from "@/app/providers";
import { ConnectButton } from "@/components/connect-button";
import { SendTransaction } from "@/components/send-transaction";

export default function SendTransactionPage() {
  const { isConnected } = useJaw();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center gap-8 p-8 pt-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Send Transaction</h1>
        <p className="mt-2 text-gray-400">
          Single &amp; batch transactions with a passkey smart account
        </p>
      </div>

      <ConnectButton />

      {isConnected && <SendTransaction />}
    </main>
  );
}
