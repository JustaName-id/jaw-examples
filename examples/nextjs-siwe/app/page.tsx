import { SignInButton } from "@/components/sign-in-button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">JAW SIWE Demo</h1>
        <p className="mt-2 text-gray-400">
          Sign-In With Ethereum using a passkey smart account
        </p>
      </div>

      <div className="w-full max-w-md">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-1 text-lg font-semibold">How it works</h2>
          <ol className="mb-6 list-inside list-decimal space-y-1.5 text-sm text-gray-400">
            <li>Click Sign In to create or use your passkey wallet</li>
            <li>The server generates a unique nonce</li>
            <li>You sign a SIWE message with your passkey</li>
            <li>The server verifies the signature on-chain</li>
            <li>A secure session cookie is set on success</li>
          </ol>
          <SignInButton />
        </div>
      </div>
    </main>
  );
}
