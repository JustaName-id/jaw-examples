import { ConnectButton } from "@/components/connect-button";
import { SponsoredTransaction } from "@/components/sponsored-transaction";

export default function GasSponsorshipPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Gas Sponsorship</h1>
        <p className="mt-2 text-gray-400">
          Send gasless transactions with paymaster sponsorship
        </p>
      </div>
      <ConnectButton />
      <SponsoredTransaction />
    </main>
  );
}
