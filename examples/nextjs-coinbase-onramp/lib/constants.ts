import type { AccountConfig } from "@jaw.id/core";

// The passkey smart account is created on Arbitrum Sepolia, but its address is
// counterfactually the same across EVM chains — so we can hand that same address
// to the on-ramp as the destination on Base, where the purchased USDC lands.
export const ACCOUNT_CHAIN_ID = 421614; // Arbitrum Sepolia

export function getAccountConfig(): AccountConfig {
  return {
    chainId: ACCOUNT_CHAIN_ID,
    apiKey: process.env.NEXT_PUBLIC_JAW_API_KEY!,
  };
}

// --- On-ramp constraints enforced by the proxy / Coinbase guest checkout ---
export const ONRAMP_NETWORK = "base" as const;
export const ONRAMP_CRYPTO = "USDC" as const;
export const ONRAMP_FIAT = "USD" as const;
export const ONRAMP_MIN_FIAT = 2; // USD
export const ONRAMP_MAX_FIAT = 500; // USD — Coinbase guest weekly cap

// Terminal states returned by GET /orders/:id — stop polling when reached.
export const ONRAMP_TERMINAL_STATUSES = ["COMPLETED", "FAILED", "EXPIRED"] as const;
