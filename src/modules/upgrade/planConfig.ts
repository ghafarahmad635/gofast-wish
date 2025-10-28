// src/config/planConfig.ts

// Common features available to all plans
export const CORE_FEATURES = [
  "SMART goal analysis",
  "Personalized coaching",
  "Progress tracking",
  "Achievement insights",
  "Advanced goal tracking",
] as const

// Limits per plan
export const PLAN_LIMITS = {
  free: {
    wishes: 1,
    habits: 3,
  },
  standard: {
    wishes: 10,
    habits: 25,
  },
  pro: {
    wishes: "Unlimited",
    habits: "Unlimited",
  },
} as const

// Plan pricing structure
export const PLAN_PRICES = {
  free: { monthly: 0, yearly: 0 },
  standard: { monthly: 5, yearly: 48 },
  pro: { monthly: 15, yearly: 144 },
} as const

// Short descriptions
export const PLAN_INFO = {
  free: "Get started with essential tools at no cost",
  standard: "Perfect for individuals building better habits",
  pro: "Ideal for teams and advanced goal management",
} as const

// ⏳ Trial days for each plan (only paid plans)
export const PLAN_TRIAL_DAYS = {
  free: 0,
  standard: 14,
  pro: 30,
} as const

export type PlanName = keyof typeof PLAN_LIMITS

// Build full feature list for each plan dynamically
export const PLAN_FEATURES = (plan: PlanName) => {
  const limits = PLAN_LIMITS[plan]

  const base = [
    { text: `Up to ${limits.wishes} Wishes` },
    { text: `Up to ${limits.habits} Habits` },
  ]

  const shared = CORE_FEATURES.map((f) => ({ text: f }))

  return [...base, ...shared]
}
