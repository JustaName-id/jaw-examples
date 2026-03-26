import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EIP-7702 + Privy — JAW Example',
  description: 'Upgrade a Privy embedded wallet to a JAW smart account via EIP-7702',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
