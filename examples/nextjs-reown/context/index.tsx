"use client";

import { wagmiAdapter, projectId, networks } from "@/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";

const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("NEXT_PUBLIC_PROJECT_ID is not defined");
}

const metadata = {
  name: "JAW Reown Example",
  description: "JAW Smart Accounts with Reown AppKit",
  url: "https://jaw.id",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
createAppKit({
  adapters: [wagmiAdapter as any],
  projectId,
  networks: [networks[0], ...networks.slice(1)],
  defaultNetwork: networks[0],
  metadata,
  features: {
    analytics: true,
  },
});

export default function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
