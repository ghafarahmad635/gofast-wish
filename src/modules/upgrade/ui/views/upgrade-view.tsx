"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ErrorState } from "@/components/error-state";
import { PricingSection } from "../components/PricingSection";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { PLAN_ORDER } from "../../constant";
import { authClient } from "@/lib/auth-client.ts";

type PlanKey = "free" | "standard" | "pro";

const UpgradeView = () => {
  const trpc = useTRPC();

  // Suspense fetch (plans)
  const { data: plans } = useSuspenseQuery(trpc.billing.getPlans.queryOptions());

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => {
      const aKey = a.key.toLowerCase();
      const bKey = b.key.toLowerCase();
      return (PLAN_ORDER[aKey] ?? 999) - (PLAN_ORDER[bKey] ?? 999);
    });
  }, [plans]);

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
        plans={sortedPlans}
        activePlan={activePlan}
        activeSubscriptionId={activeSubscriptionId}
       
      />
    </div>
  );
};

export default UpgradeView;

export const UpgradeViewViewsLoadingState = () => {
  return (
    <div className="flex-1 pb-6 px-4 md:px-8">
      <PricingSectionSkeleton />
    </div>
  );
};

export const UpgradeViewViewsErrorState = () => {
  return (
    <ErrorState
      title="Something went wrong"
      description="Please refresh and try again."
    />
  );
};

// Local skeleton component
function PricingSectionSkeleton() {
  return (
    <div className="flex w-full flex-col items-center justify-center space-y-7 p-4">
      <div className="mx-auto max-w-xl space-y-2 w-full">
        <div className="h-9 w-64 mx-auto rounded-md bg-muted animate-pulse" />
        <div className="h-5 w-80 mx-auto rounded-md bg-muted animate-pulse" />
      </div>

      <div className="h-10 w-64 rounded-md bg-muted animate-pulse" />

      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border shadow bg-white">
            <div className="border-b p-4 space-y-3">
              <div className="h-5 w-28 rounded bg-gray-300/50 animate-pulse" />
              <div className="h-4 w-40 rounded bg-gray-300/50 animate-pulse" />
              <div className="h-10 w-32 rounded bg-gray-300/50 animate-pulse mt-4" />
            </div>
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((__, j) => (
                <div key={j} className="h-4 w-full rounded bg-gray-300/50 animate-pulse" />
              ))}
            </div>
            <div className="border-t p-3">
              <div className="h-10 w-full rounded bg-gray-300/50  animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
