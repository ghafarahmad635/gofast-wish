"use client"
import React from "react"
import { cn } from "@/lib/utils"
import { type FREQUENCY, FrequencyToggle } from "./FrequencyToggle"
import { Plan, PricingCard } from "./pricing-card"


interface PricingSectionProps extends React.ComponentProps<"div"> {
  plans: Plan[]
  heading: string
  description?: string
  activePlan?: string
  activeSubscriptionId?: string | null
}

export function PricingSection({
  plans,
  heading,
  description,
  activePlan = "free",
  activeSubscriptionId,
  ...props
}: PricingSectionProps) {
  const [frequency, setFrequency] = React.useState<FREQUENCY>("monthly")

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
            key={plan.name}
            plan={plan}
            isActive={activePlan.toLowerCase() === plan.name.toLowerCase()}
            activeSubscriptionId={activeSubscriptionId ?? null}
          />
        ))}
      </div>
    </div>
  )
}
