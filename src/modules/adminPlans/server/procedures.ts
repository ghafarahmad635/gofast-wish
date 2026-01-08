import { adminProtectedProcedure, createTRPCRouter } from "@/trpc/init";
import { planUpdateSchema } from "../schema";
import { centsFromDollarsString, intOrNullFromString, nullIfEmpty } from "../utils";

export const adminPlansRouter  = createTRPCRouter({
     list: adminProtectedProcedure.query(async ({ctx}) => {
      const plans = await ctx.db.plan.findMany({
        orderBy: [{ highlighted: "desc" }, { monthlyPrice: "asc" }],
        include: {
          limits: true,
          features: { orderBy: { sortOrder: "asc" } },
        },
      });
      return plans;
    }),
    update: adminProtectedProcedure
      .input(planUpdateSchema)
      .mutation(async ({ ctx, input }) => {
        // prep work outside transaction
        const monthlyPrice = centsFromDollarsString(input.monthlyPriceUsd) ?? 0;
        const yearlyPrice = centsFromDollarsString(input.yearlyPriceUsd) ?? 0;

        const wishesLimit = intOrNullFromString(input.wishesLimit);
        const habitsLimit = intOrNullFromString(input.habitsLimit);

        const cleanFeatures = (input.features ?? [])
          .map((f) => ({
            text: (f.text ?? "").trim(),
            tooltip: nullIfEmpty(f.tooltip ?? null),
          }))
          .filter((f) => f.text.length > 0)
          .slice(0, 100); // optional safety cap

        // Only upsert limits if user provided at least one value.
        // If both are null, you can either leave as-is or set both null.
        const shouldWriteLimits = wishesLimit !== null || habitsLimit !== null;

        const updated = await ctx.db.$transaction(
          async (tx) => {
            return tx.plan.update({
              where: { id: input.id },
              data: {
                name: input.name.trim(),
                description: nullIfEmpty(input.description ?? null),

                monthlyPrice,
                yearlyPrice,

                trialDays: input.trialDays ?? 0,
                isActive: input.isActive,
                highlighted: input.highlighted,

                stripeMonthlyPriceId: nullIfEmpty(input.stripeMonthlyPriceId ?? null),
                stripeYearlyPriceId: nullIfEmpty(input.stripeYearlyPriceId ?? null),

                ...(shouldWriteLimits
                  ? {
                      limits: {
                        upsert: {
                          create: { wishesLimit, habitsLimit },
                          update: { wishesLimit, habitsLimit },
                        },
                      },
                    }
                  : {}),

                // Replace features in one go
                features: {
                  deleteMany: {},
                  create: cleanFeatures.map((f, idx) => ({
                    text: f.text,
                    tooltip: f.tooltip,
                    sortOrder: idx,
                  })),
                },
              },
              include: {
                limits: true,
                features: { orderBy: { sortOrder: "asc" } },
              },
            });
          },
          {
            timeout: 20000, // ✅ prevents "Transaction already closed" in slow dev runs
          }
        );

        return updated;
      }),

});