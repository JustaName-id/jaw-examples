import { jaw } from '@jaw.id/wagmi';

export const config = jaw({
  apiKey: process.env.NEXT_PUBLIC_JAW_API_KEY!,
  appName: 'JAW ENS Profiles',
  ens: process.env.NEXT_PUBLIC_ENS_DOMAIN!,
});
