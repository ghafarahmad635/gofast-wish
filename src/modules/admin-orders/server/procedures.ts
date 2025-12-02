import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
import { adminProtectedProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";

export const adminOrders = createTRPCRouter({
  getMany: adminProtectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        search: z.string().trim().optional().default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;

      const where: any = {};

      if (search && search.length > 0) {
        const term = search.trim();

        where.OR = [
          // order level
          {
            customerEmail: {
              contains: term,
              mode: "insensitive",
            },
          },
          {
            customerName: {
              contains: term,
              mode: "insensitive",
            },
          },
          {
            stripeInvoiceId: {
              contains: term,
              mode: "insensitive",
            },
          },
          {
            stripeSubscriptionId: {
              contains: term,
              mode: "insensitive",
            },
          },
          // linked user
          {
            user: {
              OR: [
                {
                  email: {
                    contains: term,
                    mode: "insensitive",
                  },
                },
                {
                  name: {
                    contains: term,
                    mode: "insensitive",
                  },
                },
              ],
            },
          },
        ];
      }

      const [orders, total] = await Promise.all([
        ctx.db.order.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                stripeCustomerId: true,
              },
            },
          },
        }),
        ctx.db.order.count({ where }),
      ]);

      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      return {
        items: orders,
        total,
        totalPages,
        page,
        pageSize,
      };
    }),
});
