"use client";

import { useState } from "react";
import { useJaw } from "@/app/providers";
import { ConnectButton } from "@/components/connect-button";
import { PlanSelector } from "@/components/plan-selector";
import { SubscriptionManager } from "@/components/subscription-manager";
import type { Plan } from "@/lib/constants";

export default function SubscriptionPage() {
  const { isConnected } = useJaw();
  const [subscription, setSubscription] = useState<{
    permissionId: string;
    plan: Plan;
  } | null>(null);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center gap-8 p-8 pt-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="mt-2 text-gray-400">
          End-to-end subscription payments with delegated execution
        </p>
      </div>
      <ConnectButton />
      {isConnected && !subscription && (
        <PlanSelector
          onSubscribed={(permissionId, plan) =>
            setSubscription({ permissionId, plan })
          }
        />
      )}
      {isConnected && subscription && (
        <SubscriptionManager
          permissionId={subscription.permissionId}
          plan={subscription.plan}
          onCancelled={() => setSubscription(null)}
        />
      )}
    </main>
  );
}
