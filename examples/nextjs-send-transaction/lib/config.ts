import { createConfig, http } from "wagmi";
import { mainnet, base } from "wagmi/chains";
import { jaw } from "@jaw.id/wagmi";

export const config = createConfig({
  chains: [mainnet, base],
  connectors: [
    jaw({
      apiKey: process.env.NEXT_PUBLIC_JAW_API_KEY!,
      appName: "JAW Send Transaction",
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
});
