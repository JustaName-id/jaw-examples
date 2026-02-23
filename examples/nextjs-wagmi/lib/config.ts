import { createConfig, http } from "wagmi";
import { mainnet, base } from "wagmi/chains";
import { jaw } from "@jaw.id/wagmi";

export const config = createConfig({
  chains: [mainnet, base],
  connectors: [
    jaw({
      apiKey: process.env.NEXT_PUBLIC_JAW_API_KEY!,
      appName: "JAW Wagmi Examples",
      ens: process.env.NEXT_PUBLIC_ENS_DOMAIN,
      paymasters: process.env.NEXT_PUBLIC_PIMLICO_API_KEY
        ? {
            [base.id]: {
              url: `https://api.pimlico.io/v2/${base.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`,
            },
          }
        : undefined,
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
});
