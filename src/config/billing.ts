export const STRIPE_CONFIG = {
  plans: {
    standard: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD_MONTHLY || "price_1SKYqAD8qR70pjFErK5C207r",
      annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD_ANNUAL || "price_1SN4QaD8qR70pjFEL3eaU7HH",
    },
    pro: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || "price_1SKYsZD8qR70pjFEYXwZOCm0",
      annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL || "price_1SN4PED8qR70pjFE91x8HAu9",
    },
  },
} as const;