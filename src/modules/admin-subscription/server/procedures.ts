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
          .default(2),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;

      // 1) Fetch subscriptions for this page + total count
      const [subscriptions, total] = await Promise.all([
        ctx.db.subscription.findMany({
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        ctx.db.subscription.count(),
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
