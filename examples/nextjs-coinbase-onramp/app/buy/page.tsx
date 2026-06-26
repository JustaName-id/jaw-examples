"use client";

import { useAccount } from "@/app/providers";
import { OnrampWidget } from "@/components/onramp-widget";

export default function BuyPage() {
  const { account } = useAccount();

  if (!account) {
    return (
      <div>
        <h2 className="text-2xl font-bold">Buy Crypto</h2>
        <p className="mt-2 text-sm text-gray-400">
          Connect an account first — the on-ramp needs a destination address.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Buy Crypto</h2>
        <p className="mt-1 text-sm text-gray-400">
          Buy USDC on Base with Apple Pay / Google Pay via Coinbase guest
          checkout. USDC lands in your passkey account.
        </p>
      </div>

      <OnrampWidget destinationAddress={account.address} />
    </div>
  );
}
