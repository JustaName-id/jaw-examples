import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EIP-7702 + Privy — JAW Example',
  description: 'Upgrade a Privy embedded wallet to a JAW smart account via EIP-7702',
};

// The Privy provider initializes with a runtime app ID and can't be prerendered
// at build time, so render this route dynamically (at request time).
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
