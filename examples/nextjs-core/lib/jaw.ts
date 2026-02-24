import { JAW } from "@jaw.id/core";

export const jaw = JAW.create({
  apiKey: process.env.NEXT_PUBLIC_JAW_API_KEY!,
  appName: "JAW Core Examples",
  ens: process.env.NEXT_PUBLIC_ENS_DOMAIN,
  defaultChainId: 84532,
  preference: { showTestnets: true },
});
