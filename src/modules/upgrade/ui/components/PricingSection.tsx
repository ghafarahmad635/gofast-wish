"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { type FREQUENCY, FrequencyToggle } from "./FrequencyToggle";
import { PricingCard } from "./pricing-card";
import { BillingPlanGetOne } from "../../types";

interface PricingSectionProps extends React.ComponentProps<"div"> {
  plans: BillingPlanGetOne[];
  heading: string;
  description?: string;
  activePlan?: string; // should be "free" | "standard" | "pro"
  activeSubscriptionId?: string | null;
   loading?: boolean;
}

export function PricingSection({
  plans,
  heading,
  description,
  activePlan = "free",
  activeSubscriptionId,
  ...props
}: PricingSectionProps) {
  const [frequency, setFrequency] = useState<FREQUENCY>("monthly");

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center space-y-7 p-4",
        props.className
      )}
      {...props}
    >
      <div className="mx-auto max-w-xl space-y-2">
        <h2 className="text-center font-bold text-2xl tracking-tight md:text-3xl lg:font-extrabold lg:text-4xl">
          {heading}
        </h2>
        {description && (
          <p className="text-center text-muted-foreground text-base md:text-xl">
            {description}
          </p>
        )}
      </div>

      <FrequencyToggle frequency={frequency} setFrequency={setFrequency} />

      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard
            frequency={frequency}
            key={plan.key} 
            plan={plan}
            isActive={activePlan.toLowerCase() === plan.key.toLowerCase()}
            activeSubscriptionId={activeSubscriptionId ?? null}
          />
        ))}
      </div>
    </div>
  );
}
