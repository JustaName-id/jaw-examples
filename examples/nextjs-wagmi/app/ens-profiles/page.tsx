import { EnsConnectButton } from '@/components/ens-connect-button';
import { ProfileResolver } from '@/components/profile-resolver';

export default function EnsProfilesPage() {
  return (
    <main className="min-h-screen px-4 py-16">
      <div className="mx-auto max-w-2xl space-y-10">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            ENS Profiles
          </h1>
          <p className="text-gray-400">
            ENS subnames and on-chain identity powered by{' '}
            <code className="rounded bg-gray-800 px-1.5 py-0.5 text-sm text-indigo-400">
              @jaw.id/wagmi
            </code>{' '}
            and{' '}
            <code className="rounded bg-gray-800 px-1.5 py-0.5 text-sm text-indigo-400">
              @justaname.id/sdk
            </code>
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-200">
            1. Connect Wallet
          </h2>
          <EnsConnectButton />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-200">
            2. Resolve ENS Profile
          </h2>
          <ProfileResolver />
        </section>
      </div>
    </main>
  );
}
