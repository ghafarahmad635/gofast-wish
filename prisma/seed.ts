import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // Clear existing (optional for first run only)
  // await db.planFeature.deleteMany();
  // await db.planLimit.deleteMany();
  // await db.plan.deleteMany();

  const plans = [
    {
      key: "free",
      name: "Free",
      description: "Get started with essential tools at no cost",
      isActive: true,
      monthlyPrice: 0,
      yearlyPrice: 0,
      trialDays: 0,
      highlighted: false,
      stripeMonthlyPriceId: null,
      stripeYearlyPriceId: null,
      limits: { wishesLimit: 1, habitsLimit: 3 },
      features: [
        { text: "Up to 1 Wishes", sortOrder: 1 },
        { text: "Up to 3 Habits", sortOrder: 2 },
        { text: "SMART goal analysis", sortOrder: 10 },
        { text: "Personalized coaching", sortOrder: 11 },
        { text: "Progress tracking", sortOrder: 12 },
        { text: "Achievement insights", sortOrder: 13 },
        { text: "Advanced goal tracking", sortOrder: 14 },
      ],
    },
    {
      key: "standard",
      name: "Standard",
      description: "Perfect for individuals building better habits",
      isActive: true,
      monthlyPrice: 500,
      yearlyPrice: 4800,
      trialDays: 14,
      highlighted: true,
      stripeMonthlyPriceId: process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID ?? null,
      stripeYearlyPriceId: process.env.STRIPE_STANDARD_YEARLY_PRICE_ID ?? null,
      limits: { wishesLimit: 10, habitsLimit: 25 },
      features: [
        { text: "Up to 10 Wishes", sortOrder: 1 },
        { text: "Up to 25 Habits", sortOrder: 2 },
        { text: "SMART goal analysis", sortOrder: 10 },
        { text: "Personalized coaching", sortOrder: 11 },
        { text: "Progress tracking", sortOrder: 12 },
        { text: "Achievement insights", sortOrder: 13 },
        { text: "Advanced goal tracking", sortOrder: 14 },
      ],
    },
    {
      key: "pro",
      name: "Pro",
      description: "Ideal for teams and advanced goal management",
      isActive: true,
      monthlyPrice: 1500,
      yearlyPrice: 14400,
      trialDays: 30,
      highlighted: false,
      stripeMonthlyPriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? null,
      stripeYearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? null,
      limits: { wishesLimit: null, habitsLimit: null },
      features: [
        { text: "Unlimited Wishes", sortOrder: 1 },
        { text: "Unlimited Habits", sortOrder: 2 },
        { text: "SMART goal analysis", sortOrder: 10 },
        { text: "Personalized coaching", sortOrder: 11 },
        { text: "Progress tracking", sortOrder: 12 },
        { text: "Achievement insights", sortOrder: 13 },
        { text: "Advanced goal tracking", sortOrder: 14 },
      ],
    },
  ] as const;

  for (const p of plans) {
    await db.plan.upsert({
      where: { key: p.key },
      update: {
        name: p.name,
        description: p.description,
        isActive: p.isActive,
        monthlyPrice: p.monthlyPrice,
        yearlyPrice: p.yearlyPrice,
        trialDays: p.trialDays,
        highlighted: p.highlighted,
        stripeMonthlyPriceId: p.stripeMonthlyPriceId,
        stripeYearlyPriceId: p.stripeYearlyPriceId,
      },
      create: {
        key: p.key,
        name: p.name,
        description: p.description,
        isActive: p.isActive,
        monthlyPrice: p.monthlyPrice,
        yearlyPrice: p.yearlyPrice,
        trialDays: p.trialDays,
        highlighted: p.highlighted,
        stripeMonthlyPriceId: p.stripeMonthlyPriceId,
        stripeYearlyPriceId: p.stripeYearlyPriceId,
        limits: { create: p.limits },
        // features: { create: p.features },
      },
    });

    // Keep features and limits synced for existing rows
    const planRow = await db.plan.findUnique({ where: { key: p.key } });
    if (!planRow) continue;

    await db.planLimit.upsert({
      where: { planId: planRow.id },
      update: p.limits,
      create: { planId: planRow.id, ...p.limits },
    });

    await db.planFeature.deleteMany({ where: { planId: planRow.id } });
    await db.planFeature.createMany({
      data: p.features.map((f) => ({ ...f, planId: planRow.id })),
    });
  }

  console.log("✅ Plans seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
