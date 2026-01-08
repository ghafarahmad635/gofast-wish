"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ErrorState } from "@/components/error-state";
import { PricingSection } from "../components/PricingSection";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client.ts";


type PlanKey = "free" | "standard" | "pro";

const UpgradeView = () => {
  const trpc = useTRPC();

  // Single plans fetch (suspense)
  const { data: plans } = useSuspenseQuery(trpc.billing.getPlans.queryOptions());

  // Subscription status (Better Auth)
  const [activePlan, setActivePlan] = useState<PlanKey>("free");
  const [activeSubscriptionId, setActiveSubscriptionId] = useState<string | null>(null);
  const [subLoading, setSubLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSubscription = async () => {
      setSubLoading(true);

      const { data: subscriptions, error } = await authClient.subscription.list(
        {},
        {
          onError: ({ error }) => {
            console.error("Subscription fetch failed:", error);
            toast.error("Unable to load subscription status");
          },
        }
      );

      if (!mounted) return;

      if (error) {
        setActivePlan("free");
        setActiveSubscriptionId(null);
        setSubLoading(false);
        return;
      }

      const active = subscriptions?.find(
        (sub) => sub.status === "active" || sub.status === "trialing"
      );

      const planKey = String(active?.plan ?? "free").toLowerCase() as PlanKey;

      setActivePlan(planKey);
      setActiveSubscriptionId(active?.stripeSubscriptionId ?? null);
      setSubLoading(false);
    };

    loadSubscription();

    return () => {
      mounted = false;
    };
  }, []);

  const description = useMemo(() => {
    if (subLoading) return "Loading subscription status...";
    return `Current plan: ${activePlan.toUpperCase()}`;
  }, [subLoading, activePlan]);

  return (
    <div className="flex-1 pb-6 px-4 md:px-8">
      <PricingSection
        heading="Upgrade Your Plan"
        description={description}
        plans={plans}
        activePlan={activePlan}
        activeSubscriptionId={activeSubscriptionId}
        // If your PricingSection supports loading state:
        // loading={subLoading}
      />
    </div>
  );
};

export default UpgradeView;

export const UpgradeViewViewsLoadingState = () => {
  return <div>Loading...</div>;
};

export const UpgradeViewViewsErrorState = () => {
  return <ErrorState title="Something went wrong" description="Please refresh and try again." />;
};
