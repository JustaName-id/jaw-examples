import { ConnectButton } from "@/components/connect-button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">JAW Quickstart</h1>
        <p className="mt-2 text-gray-400">
          Connect and disconnect with a passkey smart account
        </p>
      </div>
      <ConnectButton />
    </main>
  );
}
