"use client";

import { useAccount } from "@/app/providers";
import { SignMessage } from "@/components/sign-message";

export default function SigningPage() {
  const { account } = useAccount();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Message Signing</h2>
        <p className="mt-1 text-sm text-gray-400">
          Sign personal messages (EIP-191) and typed data (EIP-712) using the
          headless Account API.
        </p>
      </div>

      {account ? (
        <SignMessage />
      ) : (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-500">
          Connect your account first to sign messages.
        </div>
      )}
    </div>
  );
}
