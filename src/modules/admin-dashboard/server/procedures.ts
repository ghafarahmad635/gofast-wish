import { adminProtectedProcedure, createTRPCRouter } from "@/trpc/init";
import { Prisma } from "@prisma/client";
import z from "zod";

export const adminDashboard = createTRPCRouter({
  kpis: adminProtectedProcedure.query(async ({ ctx }) => {
    const now = new Date();

    const startOfDay = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const daysAgo = (n: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - n);
      return d;
    };

    const sevenDaysAgo = startOfDay(daysAgo(7));
    const thirtyDaysAgo = startOfDay(daysAgo(30));

    const likelyPaidStatuses = ["paid", "succeeded", "success"];
    const likelyFailedStatuses = [
      "failed",
      "canceled",
      "cancelled",
      "void",
      "uncollectible",
      "past_due",
      "unpaid",
    ];

    const [
      usersTotal,
      usersNew7d,
      usersVerifiedCount,
      usersBannedCount,
      activeSessionsCount,
      addonsEnabledCount,
      subscriptionsActiveCount,
      subscriptionsTrialingCount,
      orders30dAll,
      ordersFailedCount,
    ] = await Promise.all([
      ctx.db.user.count(),
      ctx.db.user.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      ctx.db.user.count({
        where: { emailVerified: true },
      }),
      ctx.db.user.count({
        where: { banned: true },
      }),
      ctx.db.session.count({
        where: { expiresAt: { gt: now } },
      }),
      ctx.db.addOn.count({
        where: { isEnabled: true },
      }),
      ctx.db.subscription.count({
        where: { status: "active" },
      }),
      ctx.db.subscription.count({
        where: { status: "trialing" },
      }),
      ctx.db.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { amount: true, status: true },
      }),
      ctx.db.order.count({
        where: { status: { in: likelyFailedStatuses } },
      }),
    ]);

    const verifiedPct =
      usersTotal === 0 ? 0 : Math.round((usersVerifiedCount / usersTotal) * 100);

    const revenue30dAll = orders30dAll.reduce((sum, o) => sum + (o.amount ?? 0), 0);

    const revenue30dPaidOnly = orders30dAll
      .filter((o) => likelyPaidStatuses.includes(String(o.status).toLowerCase()))
      .reduce((sum, o) => sum + (o.amount ?? 0), 0);

    return {
      usersTotal,
      usersNew7d,
      verifiedPct,
      usersBannedCount,
      activeSessionsCount,
      addonsEnabledCount,
      subscriptionsActiveCount,
      subscriptionsTrialingCount,
      ordersFailedCount,
      revenue30dAll: Math.round(revenue30dAll * 100) / 100,
      revenue30dPaidOnly: Math.round(revenue30dPaidOnly * 100) / 100,
    };
  }),

  charts: adminProtectedProcedure
    .input(
      z
        .object({
          usersDays: z.number().int().min(7).max(365).default(30),
          revenueDays: z.number().int().min(7).max(365).default(90),
          includeSubsBreakdown: z.boolean().default(true),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const usersDays = input?.usersDays ?? 30;
      const revenueDays = input?.revenueDays ?? 90;
      const includeSubsBreakdown = input?.includeSubsBreakdown ?? true;

      const now = new Date();

      const usersSince = new Date(now);
      usersSince.setDate(usersSince.getDate() - usersDays);

      const revenueSince = new Date(now);
      revenueSince.setDate(revenueSince.getDate() - revenueDays);

      const paidStatuses = ["paid", "succeeded", "success"];

      // ---------- Chart A: users by day ----------
      const usersByDay = await ctx.db.$queryRaw<
        Array<{ day: Date; count: bigint }>
      >(Prisma.sql`
        SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS count
        FROM "user"
        WHERE "createdAt" >= ${usersSince}
        GROUP BY 1
        ORDER BY 1 ASC;
      `);

      // ---------- Chart B: revenue by day ----------
      // IMPORTANT: if your real table name is "order" not "Order", change it here.
      const revenueByDay = await ctx.db.$queryRaw<
        Array<{ day: Date; total: number }>
      >(Prisma.sql`
        SELECT date_trunc('day', "createdAt") AS day, COALESCE(SUM("amount"), 0)::float8 AS total
        FROM "Order"
        WHERE "createdAt" >= ${revenueSince}
          AND LOWER("status") IN (${Prisma.join(paidStatuses.map((s) => s.toLowerCase()))})
        GROUP BY 1
        ORDER BY 1 ASC;
      `);

      // ---------- Subscription breakdown ----------
      const subsByStatus = includeSubsBreakdown
        ? await ctx.db.subscription.groupBy({
            by: ["status"],
            _count: { status: true },
            orderBy: { _count: { status: "desc" } },
          })
        : [];

      // We need Free/Standard/Pro:
      // Free = users without any subscription row.
      // This assumes subscription.referenceId is the user id (or unique per user).
      const usersTotal = await ctx.db.user.count();

      const subsRows = includeSubsBreakdown
        ? await ctx.db.subscription.findMany({
            select: { plan: true, referenceId: true },
          })
        : [];

      const normalizePlan = (p?: string | null) => {
        const v = String(p ?? "").trim().toLowerCase();
        if (v.includes("pro")) return "Pro";
        if (v.includes("standard")) return "Standard";
        // Anything else we ignore for the main 3-plan chart
        return "Other";
      };

      const planCounts = new Map<string, number>();
      for (const row of subsRows) {
        const plan = normalizePlan(row.plan);
        if (plan === "Other") continue;
        planCounts.set(plan, (planCounts.get(plan) ?? 0) + 1);
      }

      // distinct subscribed users (assumes referenceId == userId)
      const subscribedUserIds = new Set(
        subsRows
          .map((s) => String(s.referenceId ?? "").trim())
          .filter(Boolean)
      );

      const freeCount = Math.max(0, usersTotal - subscribedUserIds.size);

      const subscriptionsByPlan = [
        { plan: "Free", count: freeCount },
        { plan: "Standard", count: planCounts.get("Standard") ?? 0 },
        { plan: "Pro", count: planCounts.get("Pro") ?? 0 },
      ];

      const toISODate = (d: Date) => d.toISOString().slice(0, 10);

      return {
        usersDays,
        revenueDays,
        usersTotal,

        users: usersByDay.map((r) => ({
          date: toISODate(r.day),
          count: Number(r.count),
        })),

        revenue: revenueByDay.map((r) => ({
          date: toISODate(r.day),
          total: Number(r.total ?? 0),
        })),

        subscriptionsByStatus: subsByStatus.map((s) => ({
          status: s.status,
          count: s._count.status,
        })),

        subscriptionsByPlan,
      };
    }),
});
