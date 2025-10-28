"use client"
import React, { useState } from "react"
import { CheckCircleIcon, StarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client.ts"
import type { FREQUENCY } from "./FrequencyToggle"

export type Plan = {
  name: string
  info: string
  price: { monthly: number; yearly: number }
  features: { text: string; tooltip?: string }[]
  btn: { text: string }
  highlighted?: boolean
}

type PricingCardProps = {
  plan: Plan
  frequency?: FREQUENCY
  isActive?: boolean
} & React.ComponentProps<"div">

export function PricingCard({
  plan,
  frequency = "monthly",
  className,
  isActive = false,
  ...props
}: PricingCardProps) {
  const [loading, setLoading] = useState(false)
  const isFree = plan.name.toLowerCase() === "free"

  const handleSubscribe = async () => {
    if (isFree || isActive) return // prevent checkout

    try {
      setLoading(true)
      toast.info("Redirecting to checkout...")

      const { data, error } = await authClient.subscription.upgrade(
        {
          plan: plan.name.toLowerCase(),
          annual: frequency === "yearly",
          successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
          cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/upgrade`,
        },
        {
          onSuccess: () => console.log("✅ Checkout initiated"),
          onError: ({ error }) =>
            console.error("❌ Checkout initiation failed:", error),
        }
      )

      if (error) {
        toast.error(error.message || "Failed to start subscription.")
        return
      }

      if (data?.url) window.location.href = data.url
      else toast.error("No checkout URL returned.")
    } catch (err) {
      console.error("⚠️ Error during checkout:", err)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={cn(
        "relative flex w-full bg-white flex-col rounded-lg border shadow transition-transform",
        plan.highlighted && "scale-105",
        className
      )}
      {...props}
    >
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
        </div>

        <div className="font-medium text-lg">{plan.name}</div>
        <p className="font-normal text-muted-foreground text-sm">{plan.info}</p>
        <h3 className="mt-6 mb-2 flex items-end gap-1">
          <span className="font-extrabold text-3xl">
            ${plan.price[frequency]}
          </span>
          <span className="text-muted-foreground">
            {plan.name !== "Free"
              ? `/${frequency === "monthly" ? "month" : "year"}`
              : ""}
          </span>
        </h3>
      </div>

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

      <div
        className={cn(
          "mt-auto w-full rounded-b-lg border-t p-3",
          plan.highlighted && "bg-card dark:bg-card/80"
        )}
      >
        <Button
          className="w-full"
          variant={isActive ? "outline" : plan.highlighted ? "default" : "outline"}
          onClick={handleSubscribe}
          disabled={loading || isFree || isActive}
        >
          {isActive ? "Active Plan" : loading ? "Redirecting..." : plan.btn.text}
        </Button>
      </div>
    </div>
  )
}
