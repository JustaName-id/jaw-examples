import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { jaw } from "@jaw.id/wagmi";

export const config = createConfig({
  chains: [base],
  connectors: [
    jaw({
      apiKey: process.env.NEXT_PUBLIC_JAW_API_KEY!,
      appName: "JAW Permissions",
    }),
  ],
  transports: {
    [base.id]: http(),
  },
});
