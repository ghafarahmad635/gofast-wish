import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
import { adminProtectedProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";

export const adminSubscriptions = createTRPCRouter({
  getMany: adminProtectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),

        // filters
        search: z.string().trim().optional().default(""),
        plan: z
          .enum(["free", "standard", "pro"])
          .nullish(), // allow undefined or null
        status: z
          .enum(["incomplete", "active"])
          .nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, plan, status } = input;

      // base where for subscription
      const where: any = {};

      if (plan) {
        where.plan = plan;
      }

      if (status) {
        where.status = status;
      }

      // if search is provided, filter by user name/email via stripeCustomerId linkage
      if (search && search.length > 0) {
        const matchedUsers = await ctx.db.user.findMany({
          where: {
            OR: [
              { email: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          },
          select: {
            stripeCustomerId: true,
          },
        });

        const matchedCustomerIds = matchedUsers
          .map((u) => u.stripeCustomerId)
          .filter((id): id is string => Boolean(id));

        // if no users match search → no subscriptions
        if (matchedCustomerIds.length === 0) {
          return {
            items: [],
            total: 0,
            totalPages: 1,
            page,
            pageSize,
          };
        }

        where.stripeCustomerId = {
          in: matchedCustomerIds,
        };
      }

      // 1) Fetch subscriptions with filters + total count with same filters
      const [subscriptions, total] = await Promise.all([
        ctx.db.subscription.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        ctx.db.subscription.count({ where }),
      ]);

      // 2) Collect stripeCustomerIds from these subscriptions
      const customerIds = subscriptions
        .map((s) => s.stripeCustomerId)
        .filter((id): id is string => Boolean(id));

      let items;

      if (customerIds.length === 0) {
        // No linked users
        items = subscriptions.map((sub) => ({
          ...sub,
          user: null as null,
        }));
      } else {
        // 3) Fetch users that match these stripeCustomerIds
        const users = await ctx.db.user.findMany({
          where: {
            stripeCustomerId: {
              in: customerIds,
            },
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            stripeCustomerId: true,
          },
        });

        // Build a map: stripeCustomerId -> user
        const userByCustomerId = new Map<
          string,
          (typeof users)[number]
        >();

        for (const user of users) {
          if (user.stripeCustomerId) {
            userByCustomerId.set(user.stripeCustomerId, user);
          }
        }

        // 4) Attach `user` to each subscription
        items = subscriptions.map((sub) => ({
          ...sub,
          user:
            sub.stripeCustomerId
              ? userByCustomerId.get(sub.stripeCustomerId) ?? null
              : null,
        }));
      }

      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      return {
        items,
        total,
        totalPages,
        page,
        pageSize,
      };
    }),
});
