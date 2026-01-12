// Snippet Title: billing.getUsage tRPC query (counts + remaining based on plan limits)

import { db } from "@/lib/prisma";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const billing = createTRPCRouter({
  getPlans: baseProcedure.query(async () => {
    const plans = await db.plan.findMany({
      where: { isActive: true },
      orderBy: [{ highlighted: "desc" }, { monthlyPrice: "asc" }],
      include: {
        limits: true,
        features: { orderBy: { sortOrder: "asc" } },
      },
    });

    return plans.map((p) => ({
      key: p.key,
      name: p.name,
      info: p.description ?? "",
      price: { monthly: p.monthlyPrice, yearly: p.yearlyPrice },
      trialDays: p.trialDays,
      highlighted: p.highlighted,
      features: p.features.map((f) => ({ text: f.text, tooltip: f.tooltip ?? undefined })),
    }));
  }),

  getUsage: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.user.id;

    // User plan
    const userPlan = await db.userPlan.findUnique({
      where: { userId },
      select: { planKey: true },
    });

    const planKey = (userPlan?.planKey ?? "free") as "free" | "standard" | "pro";

    // Limits (wishesLimit = goals limit)
    const plan = await db.plan.findUnique({
      where: { key: planKey },
      select: {
        limits: { select: { wishesLimit: true, habitsLimit: true } },
      },
    });

    if (!plan?.limits) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Plan limits are not configured.",
      });
    }

    // Usage counts
    const [goalsUsed, habitsUsed] = await Promise.all([
      db.goal.count({ where: { userId } }),
      db.habit.count({ where: { userId } }),
    ]);

    const goalsLimit = plan.limits.wishesLimit; // null means unlimited
    const habitsLimit = plan.limits.habitsLimit;

    const goalsLeft = goalsLimit === null ? null : Math.max(0, goalsLimit - goalsUsed);
    const habitsLeft = habitsLimit === null ? null : Math.max(0, habitsLimit - habitsUsed);

    return {
      planKey,
      goals: {
        used: goalsUsed,
        limit: goalsLimit, // number | null
        left: goalsLeft,   // number | null
      },
      habits: {
        used: habitsUsed,
        limit: habitsLimit,
        left: habitsLeft,
      },
    };
  }),
});
