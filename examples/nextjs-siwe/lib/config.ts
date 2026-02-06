import { createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { jaw } from "@jaw.id/wagmi";

export const config = createConfig({
  chains: [mainnet],
  connectors: [
    jaw({
      apiKey: process.env.NEXT_PUBLIC_JAW_API_KEY!,
      appName: "JAW SIWE Demo",
    }),
  ],
  transports: {
    [mainnet.id]: http(),
  },
});
