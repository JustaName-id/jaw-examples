import { JAW } from "@jaw.id/core";

export const jaw = JAW.create({
  apiKey: process.env.NEXT_PUBLIC_JAW_API_KEY!,
  appName: "JAW Core Examples",
  ens: process.env.NEXT_PUBLIC_ENS_DOMAIN,
  paymasters: process.env.NEXT_PUBLIC_PIMLICO_API_KEY
    ? {
        8453: {
          url: `https://api.pimlico.io/v2/8453/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`,
        },
      }
    : undefined,
});
