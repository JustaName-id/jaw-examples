import type { AccountConfig } from "@jaw.id/core";

export const CHAIN_ID = 421614; // Arbitrum Sepolia

export const USDC_ADDRESS =
  "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d" as const; // USDC on Arbitrum Sepolia

export const DUMMY_RECIPIENT =
  "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" as const; // vitalik.eth

export function getPaymasterUrl(): string {
  return `https://api.justaname.id/proxy/v1/rpc/erc20-paymaster?chainId=${CHAIN_ID}&api-key=${process.env.NEXT_PUBLIC_JAW_API_KEY!}`;
}

export const PAYMASTER_CONTEXT = {
  token: USDC_ADDRESS,
} as const;

export function getAccountConfig(): AccountConfig {
  return {
    chainId: CHAIN_ID,
    apiKey: process.env.NEXT_PUBLIC_JAW_API_KEY!,
  };
}
