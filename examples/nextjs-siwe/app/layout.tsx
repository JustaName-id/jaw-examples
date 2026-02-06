import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "JAW SIWE Demo",
  description: "Sign-In With Ethereum using JAW passkey wallet",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
