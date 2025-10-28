"use client"
import React, { useEffect, useState } from "react"
import { toast } from "sonner"
import { PricingSection } from "../components/PricingSection"
import { authClient } from "@/lib/auth-client.ts"
import { PLAN_FEATURES, PLAN_INFO, PLAN_PRICES, PLAN_TRIAL_DAYS, PlanName } from "../../planConfig"


export default function PricingView() {
  const [activePlan, setActivePlan] = useState<PlanName>("free")
  const [activeSubscriptionId, setActiveSubscriptionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchActivePlan = async () => {
    setLoading(true)
    const { data: subscriptions, error } = await authClient.subscription.list(
      {},
      {
        onSuccess: () => console.log("✅ Subscription list fetched successfully"),
        onError: ({ error }) => {
          console.error("❌ Subscription fetch failed:", error)
          toast.error("Unable to load subscription status")
        },
      }
    )

    

    if (error) {
      setActivePlan("free")
      setActiveSubscriptionId(null)
    } else {
        console.log(subscriptions)
      const active = subscriptions?.find(
        (sub) => sub.status === "active" || sub.status === "trialing"
      )
      setActivePlan((active?.plan as PlanName) || "free")
      setActiveSubscriptionId(active?.stripeSubscriptionId ?? null)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchActivePlan()
  }, [])

  const plans = (["free", "standard", "pro"] as PlanName[]).map((plan) => ({
    name: plan.charAt(0).toUpperCase() + plan.slice(1),
    info: PLAN_INFO[plan],
    price: PLAN_PRICES[plan],
    features: PLAN_FEATURES(plan),
    trialDays: PLAN_TRIAL_DAYS[plan], 
    btn: {
      text:
        plan === "free"
          ? "Current Plan"
          : `Upgrade to ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
    },
    highlighted: plan === "standard",
  }))


  return (
    <PricingSection
      heading="Choose Your Plan"
      description={
        loading
          ? "Checking your subscription..."
          : `Current plan: ${activePlan.toUpperCase()}`
      }
      plans={plans}
      activePlan={activePlan}
      activeSubscriptionId={activeSubscriptionId}
    />
  )
}
