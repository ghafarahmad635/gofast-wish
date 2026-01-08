import { db } from "@/lib/prisma";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

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
})
})