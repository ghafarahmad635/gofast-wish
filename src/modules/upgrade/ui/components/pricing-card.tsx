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
  activeSubscriptionId?: string | null
} & React.ComponentProps<"div">

export function PricingCard({
  plan,
  frequency = "monthly",
  className,
  isActive = false,
  activeSubscriptionId = null,
  ...props
}: PricingCardProps) {
  const [loading, setLoading] = useState(false)
  const isFree = plan.name.toLowerCase() === "free"

  const handleSubscribe = async () => {
    if (isFree) return // free plan handled in app

    try {
      setLoading(true)

      // ⚡ If user already subscribed, redirect to billing portal instead of re-subscribing
      if (isActive && activeSubscriptionId) {
        toast.info("Redirecting to your billing portal...")

        const { data, error } = await authClient.subscription.billingPortal({
         
          returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/upgrade`,
          
         
        })

        if (error) {
          console.error("❌ Failed to open billing portal:", error)
          toast.error("Unable to open billing portal.")
          return
        }

        if (data?.url) {
          window.location.href = data.url
        } else {
          toast.error("Billing portal link unavailable.")
        }

        return // ✅ Stop here, don't continue to upgrade flow
      }

      // 🛒 Otherwise, start checkout session
      toast.info("Redirecting to checkout...")

      const { data, error } = await authClient.subscription.upgrade(
        {
          plan: plan.name.toLowerCase(),
          annual: frequency === "yearly",
          subscriptionId: activeSubscriptionId ?? undefined,
          successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/upgrade`,
          cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/upgrade`,
        },
        {
          onSuccess: () => {
            toast.success("Checkout initiated")
          },
          onError: ({ error }) =>
            console.error("❌ Checkout initiation failed:", error),
        }
      )

      if (error) {
        toast.error(error.message || "Failed to start subscription.")
        return
      }

     
    } catch (err) {
      console.error("⚠️ Error during checkout:", err)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // 🎯 Calculate yearly discount badge
  const discount =
    plan.price.yearly > 0
      ? Math.round(
          ((plan.price.monthly * 12 - plan.price.yearly) /
            (plan.price.monthly * 12)) *
            100
        )
      : 0

  return (
    <div
      className={cn(
        "relative flex w-full bg-white flex-col rounded-lg border shadow transition-transform",
        plan.highlighted && "scale-105",
        className
      )}
      {...props}
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
          variant={isActive ? "outline" : plan.highlighted ? "default" : "outline"}
          onClick={handleSubscribe}
          disabled={loading || isFree}
        >
          {loading
            ? "Redirecting..."
            : isActive
            ? "Manage Subscription"
            : plan.btn.text}
        </Button>
      </div>
    </div>
  )
}
