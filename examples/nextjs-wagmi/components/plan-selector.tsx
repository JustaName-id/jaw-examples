"use client";

import { useState } from "react";
import { useGrantPermissions } from "@jaw.id/wagmi";
import { parseUnits } from "viem";
import {
  PLANS,
  USDC_ADDRESS,
  SERVICE_SPENDER,
  type Plan,
} from "@/lib/constants";

interface PlanSelectorProps {
  onSubscribed: (permissionId: string, plan: Plan) => void;
}

export function PlanSelector({ onSubscribed }: PlanSelectorProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { mutate: grantPermission, isPending } = useGrantPermissions();

  function subscribe(plan: Plan) {
    setSelectedPlan(plan.id);

    grantPermission(
      {
        expiry: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
        spender: SERVICE_SPENDER,
        permissions: {
          spends: [
            {
              token: USDC_ADDRESS,
              allowance: parseUnits(plan.price, 6).toString(),
              unit: "month",
              multiplier: 1,
            },
          ],
          calls: [
            {
              target: USDC_ADDRESS,
              functionSignature: "transfer(address,uint256)",
            },
          ],
        },
      },
      {
        onSuccess: (data) => {
          onSubscribed(data.permissionId, plan);
        },
        onError: () => {
          setSelectedPlan(null);
        },
      }
    );
  }

  return (
    <div className="w-full">
      <h2 className="mb-6 text-center text-xl font-semibold">Choose a Plan</h2>

      <div className="grid gap-6 sm:grid-cols-3">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const isDisabled = isPending && !isSelected;

          return (
            <div
              key={plan.id}
              className={`flex flex-col rounded-xl border bg-gray-900 p-6 transition-colors ${
                isSelected
                  ? "border-blue-500"
                  : "border-gray-800 hover:border-gray-700"
              }`}
            >
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-gray-400">{plan.description}</p>

              <div className="mt-4">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-gray-400"> / month</span>
              </div>

              <ul className="mt-6 flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-gray-300"
                  >
                    <span className="mt-0.5 text-green-400">&#10003;</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => subscribe(plan)}
                disabled={isPending || isDisabled}
                className={`mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                  plan.id === "pro"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                {isSelected && isPending ? "Confirming..." : "Subscribe"}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-gray-500">
        Subscribing grants a monthly USDC spending permission to the service.
        You can revoke it at any time.
      </p>
    </div>
  );
}
