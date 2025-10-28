// src/config/planConfig.ts

export const CORE_FEATURES = [
  "SMART goal analysis",
  "Personalized coaching",
  "Progress tracking",
  "Achievement insights",
] as const

export const PLAN_LIMITS = {
  free: {
    wishes: 1,
    habits: 3,
    storage: "1GB",
  },
  standard: {
    wishes: 10,
    habits: 25,
    storage: "10GB",
  },
  pro: {
    wishes: "Unlimited",
    habits: "Unlimited",
    storage: "100GB",
  },
} as const

export const PLAN_PRICES = {
  free: { monthly: 0, yearly: 0 },
  standard: { monthly: 9, yearly: 90 },
  pro: { monthly: 29, yearly: 290 },
} as const

export const PLAN_INFO = {
  free: "Get started with essential tools at no cost",
  standard: "Perfect for individuals building better habits",
  pro: "Ideal for teams and advanced goal management",
} as const

export type PlanName = keyof typeof PLAN_LIMITS

export const PLAN_FEATURES = (plan: PlanName) => {
  const limits = PLAN_LIMITS[plan]

  const base = [
    { text: `Up to ${limits.wishes} Wishes` },
    { text: `Up to ${limits.habits} Habits` },
    { text: `${limits.storage} storage` },
  ]

  // Add core features to all plans
  const shared = CORE_FEATURES.map((f) => ({ text: f }))

  // Add plan-specific extras
  const extra =
    plan === "pro"
      ? [{ text: "Advanced goal tracking" }]
      : plan === "standard"
      ? []
      : []

  return [...base, ...extra, ...shared]
}
