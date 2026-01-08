"use client";

import React, { useMemo, useState } from "react";
import { CheckCircleIcon, StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import type { FREQUENCY } from "./FrequencyToggle";
import { BillingPlanGetOne } from "../../types";
import { authClient } from "@/lib/auth-client.ts";

type PricingCardProps = {
  plan: BillingPlanGetOne;
  frequency?: FREQUENCY;
  isActive?: boolean;
  activeSubscriptionId?: string | null;
  disabled?: boolean;
} 

export function PricingCard({
  plan,
  frequency = "monthly",
  isActive = false,
  activeSubscriptionId = null,
  disabled 
  

}: PricingCardProps) {
  const [loading, setLoading] = useState(false);

  // ✅ identity should be based on key, not name
  const isFree = plan.key.toLowerCase() === "free";

  const discount = useMemo(() => {
    const monthly = plan.price.monthly;
    const yearly = plan.price.yearly;
    if (!yearly || !monthly) return 0;
    const yearlyEquivalent = monthly * 12;
    if (yearlyEquivalent <= 0) return 0;
    return Math.round(((yearlyEquivalent - yearly) / yearlyEquivalent) * 100);
  }, [plan.price.monthly, plan.price.yearly]);

  const priceCents = frequency === "monthly" ? plan.price.monthly : plan.price.yearly;
  const priceLabel =
  isFree || !priceCents
    ? "$0"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(priceCents / 100);

  const handleSubscribe = async () => {
    if (isFree) return;

    try {
      setLoading(true);

      // If current plan is active and has sub id -> billing portal
      if (isActive && activeSubscriptionId) {
        toast.info("Redirecting to billing portal...");

        const { data, error } = await authClient.subscription.billingPortal({
          returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/upgrade`,
        });

        if (error) {
          console.error("Billing portal error:", error);
          toast.error("Unable to open billing portal.");
          return;
        }

        if (data?.url) window.location.href = data.url;
        else toast.error("Billing portal link unavailable.");

        return;
      }

      toast.info("Redirecting to checkout...");

      const { data, error } = await authClient.subscription.upgrade(
        {
          // ✅ Better Auth expects the plan identifier.
          // You mapped StripePlan.name = Plan.key on server.
          plan: plan.key.toLowerCase(),

          annual: frequency === "yearly",

          // ✅ pass subscriptionId when switching plans if user already has one
          subscriptionId: activeSubscriptionId ?? undefined,

          successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/upgrade`,
          cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/upgrade`,
        },
        {
          onSuccess: () => {
            toast.success("Checkout initiated")
          },
          onError: ({ error }) => console.error("Checkout initiation failed:", error),
        }
      );

      if (error) {
        toast.error(error.message || "Failed to start subscription.");
        return;
      }

      // If Better Auth returns a URL (depends on config), redirect explicitly
      if ((data as any)?.url) {
        window.location.href = (data as any).url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const buttonText = useMemo(() => {
    if (loading) return "Redirecting...";
    if (isFree) return "Current Plan";
    if (isActive) return "Manage Subscription";
    return `Upgrade to ${plan.name}`;
  }, [loading, isFree, isActive, plan.name]);

  return (
    <div
      className={cn(
        "relative flex w-full flex-col rounded-lg border shadow transition-transform bg-white",
        plan.highlighted && "scale-105",
        
      )}
     
    >
      {/* Header */}
      <div
        className={cn(
          "rounded-t-lg border-b p-4",
          plan.highlighted && "bg-card dark:bg-card/80"
        )}
      >
        <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
          {plan.highlighted && (
            <p className="flex items-center gap-1 rounded-md border bg-background px-2 py-0.5 text-xs">
              <StarIcon className="h-3 w-3 fill-current" />
              Popular
            </p>
          )}
          {isActive && (
            <p className="flex items-center gap-1 rounded-md border bg-green-600 text-white px-2 py-0.5 text-xs">
              Active
            </p>
          )}
          {frequency === "yearly" && discount > 0 && !isFree && (
            <p className="flex items-center gap-1 rounded-md border bg-primary px-2 py-0.5 text-primary-foreground text-xs">
              {discount}% off
            </p>
          )}
        </div>

        <div className="font-medium text-lg">{plan.name}</div>
        <p className="font-normal text-muted-foreground text-sm">{plan.info}</p>

        <h3 className="mt-6 mb-2 flex items-end gap-1">
          <span className="font-extrabold text-3xl"> {priceLabel}</span>
          <span className="text-muted-foreground">
            {!isFree ? `/${frequency === "monthly" ? "month" : "year"}` : ""}
          </span>
        </h3>

        {!isFree && (plan.trialDays ?? 0) > 0 && !isActive && (
          <p className="text-xs font-medium text-green-600 mb-2">
            {plan.trialDays}-day free trial included
          </p>
        )}
      </div>

      {/* Features */}
      <div
        className={cn(
          "space-y-4 px-4 pt-6 pb-8 text-muted-foreground text-sm",
          plan.highlighted && "bg-muted/10"
        )}
      >
        {plan.features.map((feature, i) => (
          <div className="flex items-center gap-2" key={i}>
            <CheckCircleIcon className="h-4 w-4 text-foreground" />
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <p className={cn(feature.tooltip && "cursor-pointer border-b")}>
                    {feature.text}
                  </p>
                </TooltipTrigger>
                {feature.tooltip && (
                  <TooltipContent>
                    <p>{feature.tooltip}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        ))}
      </div>

      {/* Button */}
      <div
        className={cn(
          "mt-auto w-full rounded-b-lg border-t p-3",
          plan.highlighted && "bg-card dark:bg-card/80"
        )}
      >
        <Button
          className="w-full"
          variant={
            isFree
              ? "outline"
              : isActive
              ? "outline"
              : plan.highlighted
              ? "default"
              : "outline"
          }
          onClick={handleSubscribe}
          disabled={disabled || loading || isFree}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
