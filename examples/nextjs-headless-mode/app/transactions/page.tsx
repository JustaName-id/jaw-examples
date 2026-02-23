"use client";

import { useAccount } from "@/app/providers";
import { SendTransaction } from "@/components/send-transaction";

export default function TransactionsPage() {
  const { account } = useAccount();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Transactions</h2>
        <p className="mt-1 text-sm text-gray-400">
          Send single transactions, batch multiple calls, and estimate gas using
          the headless Account API.
        </p>
      </div>

      {account ? (
        <SendTransaction />
      ) : (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-500">
          Connect your account first to send transactions.
        </div>
      )}
    </div>
  );
}
