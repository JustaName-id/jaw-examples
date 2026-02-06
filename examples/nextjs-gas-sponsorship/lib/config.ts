import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { jaw } from "@jaw.id/wagmi";

export const config = createConfig({
  chains: [base],
  connectors: [
    jaw({
      apiKey: process.env.NEXT_PUBLIC_JAW_API_KEY!,
      appName: "JAW Gas Sponsorship",
      paymasters: {
        [base.id]: {
          url: `https://api.pimlico.io/v2/${base.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`,
        },
      },
    }),
  ],
  transports: {
    [base.id]: http(),
  },
});
