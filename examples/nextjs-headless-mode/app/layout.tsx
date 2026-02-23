import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AccountProvider } from "./providers";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JAW Headless Mode",
  description:
    "Headless smart account operations with the JAW Account API — no wagmi, no UI library",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gray-950 text-white antialiased`}
      >
        <AccountProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">{children}</main>
          </div>
        </AccountProvider>
      </body>
    </html>
  );
}
