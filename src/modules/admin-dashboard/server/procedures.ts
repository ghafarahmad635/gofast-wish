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

      const usersByDay = await ctx.db.$queryRaw<
        Array<{ day: Date; count: bigint }>
      >(Prisma.sql`
        SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS count
        FROM "user"
        WHERE "createdAt" >= ${usersSince}
        GROUP BY 1
        ORDER BY 1 ASC;
      `);

      // IMPORTANT: if your table is actually "order" not "Order", change this:
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

      const subsByStatus = includeSubsBreakdown
        ? await ctx.db.subscription.groupBy({
            by: ["status"],
            _count: { status: true },
            orderBy: { _count: { status: "desc" } },
          })
        : [];

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
        return "Other";
      };

      const planCounts = new Map<string, number>();
      for (const row of subsRows) {
        const plan = normalizePlan(row.plan);
        if (plan === "Other") continue;
        planCounts.set(plan, (planCounts.get(plan) ?? 0) + 1);
      }

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

  overview: adminProtectedProcedure
    .input(
      z
        .object({
          recentUsersLimit: z.number().int().min(5).max(50).default(10),
          recentOrdersLimit: z.number().int().min(5).max(50).default(10),
          attentionLimit: z.number().int().min(5).max(50).default(12),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const recentUsersLimit = input?.recentUsersLimit ?? 10;
      const recentOrdersLimit = input?.recentOrdersLimit ?? 10;
      const attentionLimit = input?.attentionLimit ?? 12;

      const now = new Date();

      const daysAgo = (n: number) => {
        const d = new Date(now);
        d.setDate(d.getDate() - n);
        return d;
      };

      const sevenDaysAgo = daysAgo(7);
      const fourteenDaysAgo = daysAgo(14);

      // Recent users
      const recentUsers = await ctx.db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: recentUsersLimit,
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          banned: true,
          banExpires: true,
          createdAt: true,
        },
      });

      // Recent orders
      const recentOrders = await ctx.db.order.findMany({
        orderBy: { createdAt: "desc" },
        take: recentOrdersLimit,
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          createdAt: true,
          customerEmail: true,
          customerName: true,
          hostedInvoiceUrl: true,
          invoicePdfUrl: true,
          userId: true,
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      });

      // Plans for recent users: Free if no subscription
      // Assumes subscription.referenceId === user.id
      const userIds = recentUsers.map((u) => u.id);

      const subsForRecentUsers = await ctx.db.subscription.findMany({
        where: { referenceId: { in: userIds } },
        select: { referenceId: true, plan: true, status: true },
      });

      const normalizePlan = (p?: string | null) => {
        const v = String(p ?? "").trim().toLowerCase();
        if (v.includes("pro")) return "Pro";
        if (v.includes("standard")) return "Standard";
        return "Free";
      };

      const planByUserId = new Map<string, "Free" | "Standard" | "Pro">();
      for (const s of subsForRecentUsers) {
        const uid = String(s.referenceId ?? "").trim();
        if (!uid) continue;
        planByUserId.set(uid, normalizePlan(s.plan));
      }

      const recentUsersWithPlan = recentUsers.map((u) => ({
        ...u,
        plan: planByUserId.get(u.id) ?? "Free",
      }));

      // ---- Attention Needed ----
      // 1) Unverified users older than 7 days
      const unverifiedOlder = await ctx.db.user.findMany({
        where: {
          emailVerified: false,
          createdAt: { lt: sevenDaysAgo },
          banned: { not: true },
        },
        orderBy: { createdAt: "asc" },
        take: Math.min(attentionLimit, 6),
        select: { id: true, email: true, name: true, createdAt: true },
      });

      // 2) Bans expiring in next 7 days
      const bansExpiringSoon = await ctx.db.user.findMany({
        where: {
          banned: true,
          banExpires: { not: null, lte: daysAgo(-7), gt: now }, // lte now+7 days, gt now
        },
        take: Math.min(attentionLimit, 6),
        orderBy: { banExpires: "asc" },
        select: { id: true, email: true, name: true, banExpires: true },
      }).catch(async () => {
        // If your Prisma doesn't like date math above, do a safer variant:
        const in7 = new Date(now);
        in7.setDate(in7.getDate() + 7);
        return ctx.db.user.findMany({
          where: {
            banned: true,
            banExpires: { not: null, lte: in7, gt: now },
          },
          take: Math.min(attentionLimit, 6),
          orderBy: { banExpires: "asc" },
          select: { id: true, email: true, name: true, banExpires: true },
        });
      });

      // 3) Failed orders in last 14 days
      const failedStatuses = [
        "failed",
        "canceled",
        "cancelled",
        "void",
        "uncollectible",
        "past_due",
        "unpaid",
      ];

      const failedOrdersRecent = await ctx.db.order.findMany({
        where: {
          createdAt: { gte: fourteenDaysAgo },
          status: { in: failedStatuses },
        },
        orderBy: { createdAt: "desc" },
        take: Math.min(attentionLimit, 6),
        select: {
          id: true,
          status: true,
          amount: true,
          createdAt: true,
          customerEmail: true,
          userId: true,
          user: { select: { id: true, email: true, name: true } },
        },
      });

      // 4) Suspicious session volume: users with many active sessions
      // (Example threshold: >= 5 active sessions)
      const activeSessions = await ctx.db.session.findMany({
        where: { expiresAt: { gt: now } },
        select: { userId: true },
      });

      const sessionCounts = new Map<string, number>();
      for (const s of activeSessions) {
        sessionCounts.set(s.userId, (sessionCounts.get(s.userId) ?? 0) + 1);
      }

      const suspiciousUserIds = Array.from(sessionCounts.entries())
        .filter(([, c]) => c >= 5)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);

      const suspiciousUsers = suspiciousUserIds.length
        ? await ctx.db.user.findMany({
            where: { id: { in: suspiciousUserIds } },
            select: { id: true, email: true, name: true },
          })
        : [];

      // Build unified attention list (simple + actionable)
      type AttentionItem =
        | {
            type: "UNVERIFIED_OLD";
            title: string;
            detail: string;
            href: string;
            createdAt?: Date;
          }
        | {
            type: "BAN_EXPIRING";
            title: string;
            detail: string;
            href: string;
            expiresAt?: Date | null;
          }
        | {
            type: "FAILED_ORDER";
            title: string;
            detail: string;
            href: string;
            createdAt?: Date;
          }
        | {
            type: "MANY_SESSIONS";
            title: string;
            detail: string;
            href: string;
          };

      const attention: AttentionItem[] = [];

      for (const u of unverifiedOlder) {
        attention.push({
          type: "UNVERIFIED_OLD",
          title: "Unverified user",
          detail: `${u.email} (created ${u.createdAt.toISOString().slice(0, 10)})`,
          href: "/admin/users",
          createdAt: u.createdAt,
        });
      }

      for (const u of bansExpiringSoon) {
        attention.push({
          type: "BAN_EXPIRING",
          title: "Ban expiring soon",
          detail: `${u.email} (expires ${u.banExpires?.toISOString().slice(0, 10) ?? "N/A"})`,
          href: "/admin/users",
          expiresAt: u.banExpires,
        });
      }

      for (const o of failedOrdersRecent) {
        const email =
          o.user?.email ?? o.customerEmail ?? "Unknown customer";
        attention.push({
          type: "FAILED_ORDER",
          title: "Failed order",
          detail: `${email} (${String(o.status)} • ${o.amount})`,
          href: "/admin/orders",
          createdAt: o.createdAt,
        });
      }

      for (const u of suspiciousUsers) {
        const count = sessionCounts.get(u.id) ?? 0;
        attention.push({
          type: "MANY_SESSIONS",
          title: "Many active sessions",
          detail: `${u.email} (${count} sessions)`,
          href: "/admin/users",
        });
      }

      // Sort attention by “most urgent” feel (simple heuristic)
      const attentionSorted = attention
        .slice(0, attentionLimit);

      return {
        recentUsers: recentUsersWithPlan.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          emailVerified: u.emailVerified,
          banned: u.banned ?? false,
          plan: u.plan,
          createdAt: u.createdAt,
        })),
        recentOrders: recentOrders.map((o) => ({
          id: o.id,
          amount: o.amount,
          currency: o.currency,
          status: o.status,
          createdAt: o.createdAt,
          customerEmail: o.customerEmail,
          customerName: o.customerName,
          hostedInvoiceUrl: o.hostedInvoiceUrl,
          invoicePdfUrl: o.invoicePdfUrl,
          user: o.user
            ? { id: o.user.id, email: o.user.email, name: o.user.name }
            : null,
        })),
        attention: attentionSorted,
      };
    }),
});
