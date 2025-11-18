import { NextResponse } from "next/server";
import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import {
  aiBudgetPlanSchema,
  formSchema,
} from "@/modules/addons/tools/BudgetPlanner/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({
  id: z.string().uuid(),
  values: formSchema,
  planCount: z.number().min(1).max(6).default(3),
});

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id, values, planCount } = parsed.data;

  const addon = await db.addOn.findUnique({
    where: { id },
    select: {
      name: true,
      systemPrompt: true,
      customPrompt: true,
      isEnabled: true,
    },
  });

  if (!addon) {
    return NextResponse.json({ error: "Add-on not found" }, { status: 404 });
  }
  if (!addon.isEnabled) {
    return NextResponse.json({ error: "Add-on disabled" }, { status: 403 });
  }

  const sumObjectValues = (obj: Record<string, number>) =>
    Object.values(obj || {}).reduce((sum, v) => sum + (v || 0), 0);

  const totalFixed = sumObjectValues(values.fixed);
  const totalVariable = sumObjectValues(values.variable);

  const totalCreditCardMin = values.debts.credit_cards.reduce(
    (sum, d) => sum + d.min_payment,
    0,
  );
  const totalLoanMin = values.debts.loans.reduce(
    (sum, d) => sum + d.min_payment,
    0,
  );
  const totalDebtMinPayments = totalCreditCardMin + totalLoanMin;

  const totalIncome =
    (values.net_monthly_income || 0) + (values.other_income || 0);
  const totalExpenses = totalFixed + totalVariable + totalDebtMinPayments;
  const surplusOrDeficit = totalIncome - totalExpenses;

  const systemPrompt =
    addon.systemPrompt ||
    `
You are ${addon.name}, an expert personal finance coach.

You must return a JSON array with exactly ${planCount} items.
Each item must be one complete monthly budget plan object that matches the provided schema.
Never return fewer than ${planCount} items and never more than ${planCount} items.
The plans must be meaningfully different in strategy, such as:
- Plan focused on aggressive debt payoff
- Plan focused on balanced savings and lifestyle
- Plan focused on emergency fund and safety

Do not mention that you are creating multiple plans.
Inside each plan, act as if it is the only plan.
    `.trim();

  const financialSnapshot = {
    income: {
      net_monthly_income: values.net_monthly_income,
      other_income: values.other_income,
      total_income: totalIncome,
    },
    fixed: values.fixed,
    variable: values.variable,
    debts: values.debts,
    goals: values.goals,
    prefs: values.prefs,
    totals: {
      totalFixed,
      totalVariable,
      totalDebtMinPayments,
      totalExpenses,
      surplusOrDeficit,
    },
  };

  const customUserPrompt = addon.customPrompt
    ? `${addon.customPrompt}

You are given the user financial snapshot in JSON.
Based on this, produce exactly ${planCount} different complete budget plans.
Each array item must be a full plan object that conforms to the schema:

User financial snapshot JSON:
${JSON.stringify(financialSnapshot, null, 2)}`
    : `
You are given the user financial snapshot in JSON.
Produce exactly ${planCount} different complete budget plans.
Each array item must be a full plan object that conforms to the schema:

User financial snapshot JSON:
${JSON.stringify(financialSnapshot, null, 2)}
    `.trim();

  const result = streamObject({
    model: openai("gpt-4.1"),
    output: "array",
    schema: aiBudgetPlanSchema, // schema for one plan
    system: systemPrompt,
    prompt: customUserPrompt,
  });

  return result.toTextStreamResponse();
}
