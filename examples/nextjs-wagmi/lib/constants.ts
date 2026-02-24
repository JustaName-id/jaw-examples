import type { Address } from "viem";

/** USDC on Base Sepolia */
export const USDC_ADDRESS: Address =
  "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

/**
 * The spender address that your server controls.
 * This must match the public address derived from SPENDER_PRIVATE_KEY.
 * Replace with your own spender address.
 */
export const SERVICE_SPENDER: Address =
  "0x0000000000000000000000000000000000000001";

/**
 * The treasury address that receives subscription payments.
 * Replace with your own treasury address.
 */
export const SERVICE_TREASURY: Address =
  "0x0000000000000000000000000000000000000002";

/** ERC-20 transfer ABI fragment */
export const TRANSFER_ABI = [
  {
    name: "transfer",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

/** Subscription plans */
export const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: "5",
    description: "Perfect for individuals getting started",
    features: [
      "1,000 API calls / month",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "15",
    description: "For growing teams that need more power",
    features: [
      "50,000 API calls / month",
      "Advanced analytics",
      "Priority support",
      "Custom webhooks",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "50",
    description: "Unlimited scale for large organizations",
    features: [
      "Unlimited API calls",
      "Real-time analytics",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
    ],
  },
] as const;

export type Plan = (typeof PLANS)[number];
