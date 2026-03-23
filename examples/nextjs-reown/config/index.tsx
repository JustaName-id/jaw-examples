import { cookieStorage, createStorage, http } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { baseSepolia, base } from "@reown/appkit/networks";
import { jaw } from "@jaw.id/wagmi";

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_PROJECT_ID is not defined");
}

export const networks = [baseSepolia, base];

const jawConnector = jaw({
  apiKey: process.env.NEXT_PUBLIC_JAW_API_KEY!,
  appName: "JAW Reown Example",
  defaultChainId: baseSepolia.id,
  preference: { showTestnets: true },
  paymasters: process.env.NEXT_PUBLIC_PIMLICO_API_KEY
    ? {
        [base.id]: {
          url: `https://api.pimlico.io/v2/${base.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`,
        },
      }
    : undefined,
});

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
  connectors: [jawConnector],
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http(),
  },
});

export const config = wagmiAdapter.wagmiConfig;
