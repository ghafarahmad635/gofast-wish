

import { z } from "zod";

export const money = z.coerce.number().min(0, "Must be 0 or more").default(0);

export const debtItem = z.object({
  name: z.string().min(1, "Required"),
  balance: money,
  apr: z.coerce.number().min(0).max(100).default(0),
  min_payment: money,
});

export const formSchema = z.object({
  net_monthly_income: money,
  other_income: money,

  fixed: z.object({
    housing: money,
    utilities: money,
    insurance: money,
    internet: money,
    phone: money,
    transport: money,
    subscriptions: money,
  }),

  variable: z.object({
    groceries: money,
    eating_out: money,
    entertainment: money,
    shopping: money,
    misc: money,
  }),

  debts: z.object({
    credit_cards: z.array(debtItem).default([]),
    loans: z.array(debtItem).default([]),
  }),

  goals: z.object({
    emergency_fund_target: money,
    payoff_priority: z.enum(["avalanche", "snowball"]).default("avalanche"),
    savings_goal: z.string().max(300).optional(),
    timeframe_months: z.coerce.number().min(1).max(240).default(12),
  }),

  prefs: z.object({
    must_keep_subscriptions: z.string().max(300).optional(),
    hard_caps: z.string().max(300).optional(),
    notes: z.string().max(300).optional(),
  }),
});

export type FormValues = z.infer<typeof formSchema>;

export const initialValues: Partial<FormValues> = {
  net_monthly_income: 0,
  other_income: 0,
  fixed: {
    housing: 0, utilities: 0, insurance: 0, internet: 0, phone: 0, transport: 0, subscriptions: 0,
  },
  variable: {
    groceries: 0, eating_out: 0, entertainment: 0, shopping: 0, misc: 0,
  },
  debts: { credit_cards: [], loans: [] },
  goals: { emergency_fund_target: 0, payoff_priority: "avalanche", timeframe_months: 12 },
  prefs: {},
};
