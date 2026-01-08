import { z } from "zod";

export const planFeatureSchema = z.object({
  text: z.string().trim().min(1),
  tooltip: z.string().trim().optional(),
});

const moneyString = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^\d+(\.\d{1,2})?$/.test(v), "Invalid amount");

const wholeNumberString = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^\d+$/.test(v), "Must be a whole number");

export const planUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),

  monthlyPriceUsd: moneyString,
  yearlyPriceUsd: moneyString,

  // MUST be this. No preprocess. No any. No unknown.
  trialDays: z.coerce.number().int().min(0).default(0),

  isActive: z.boolean().default(true),
  highlighted: z.boolean().default(false),

  stripeMonthlyPriceId: z.string().trim().optional(),
  stripeYearlyPriceId: z.string().trim().optional(),

  wishesLimit: wholeNumberString,
  habitsLimit: wholeNumberString,

  features: z.array(planFeatureSchema).default([]),
});

export type PlanUpdateSchema = z.infer<typeof planUpdateSchema>;
