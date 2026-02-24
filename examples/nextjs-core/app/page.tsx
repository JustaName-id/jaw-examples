import Link from "next/link";

const examples = [
  {
    href: "/quickstart",
    label: "Quickstart",
    description: "Connect & disconnect with a passkey smart account",
  },
  {
    href: "/sign-message",
    label: "Sign Message",
    description: "personal_sign + EIP-712 typed data signing",
  },
  {
    href: "/send-transaction",
    label: "Send Transaction",
    description: "Single, batch, and ERC-20 transactions",
  },
  {
    href: "/gas-sponsorship",
    label: "Gas Sponsorship",
    description: "Gasless transactions via paymaster",
  },
  {
    href: "/permissions",
    label: "Permissions",
    description: "Grant & revoke ERC-7715 permissions",
  },
  {
    href: "/ens-profiles",
    label: "ENS Profiles",
    description: "Subnames & on-chain profile resolution",
  },
  {
    href: "/siwe",
    label: "SIWE",
    description: "Sign-In With Ethereum authentication",
  },
  {
    href: "/subscription",
    label: "Subscription",
    description: "Recurring USDC payments with delegated execution",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">JAW Core Examples</h1>
        <p className="mt-3 text-gray-400">
          A collection of Next.js examples using{" "}
          <code className="rounded bg-gray-800 px-1.5 py-0.5 text-sm text-blue-400">
            @jaw.id/core
          </code>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {examples.map((example) => (
          <Link
            key={example.href}
            href={example.href}
            className="group rounded-xl border border-gray-800 bg-gray-900 p-5 transition-colors hover:border-gray-700 hover:bg-gray-800/50"
          >
            <h2 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
              {example.label}
            </h2>
            <p className="mt-1 text-sm text-gray-400">{example.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
