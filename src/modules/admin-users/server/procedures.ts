import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";
import { adminProtectedProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";

const RoleEnum = z.enum(["USER", "SUPERADMIN"]);
const BanStatusEnum = z.enum(["not_banned", "banned"]);
const LoginStatusEnum = z.enum(["online", "offline"]);
const EmailStatusEnum = z.enum(["verified", "not_verified"]);

export const adminUsers  = createTRPCRouter({
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
        search: z.string().optional(),            
        role: RoleEnum.nullish(),
        ban_status: BanStatusEnum.nullish(),
         login_status: LoginStatusEnum.nullish(),
         email_status: EmailStatusEnum.nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, role, ban_status, login_status,
        email_status, } = input;

      const where: any = {};

      if (search && search.trim()) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      if (role) {
        where.role = role;
      }

       if (ban_status === "banned") {
        where.banned = true;
      } else if (ban_status === "not_banned") {
        where.banned = false;
      }
      // login_status -> loginStatus: boolean
      if (login_status === "online") {
        where.loginStatus = true;
      } else if (login_status === "offline") {
        where.loginStatus = false;
      }

      // email_status -> emailVerified: boolean
      if (email_status === "verified") {
        where.emailVerified = true;
      } else if (email_status === "not_verified") {
        where.emailVerified = false;
      }

      const [users, total] = await Promise.all([
        ctx.db.user.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: "desc" },
        }),
        ctx.db.user.count({ where }),
      ]);

      // collect stripeCustomerIds from these users
      const stripeCustomerIds = users
        .map((u) => u.stripeCustomerId)
        .filter((id): id is string => Boolean(id));

      // if no one has stripe id, just return users as is
      if (stripeCustomerIds.length === 0) {
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        return {
          items: users.map((u) => ({ ...u, subscription: null })),
          total,
          totalPages,
          page,
          pageSize,
        };
      }

      // fetch subscriptions for all those stripeCustomerIds
      const subscriptions = await ctx.db.subscription.findMany({
        where: {
          stripeCustomerId: { in: stripeCustomerIds },
          // optional: only active
          // status: "active",
        },
        orderBy: {
          createdAt: "desc", // newest first
        },
        select: {
          id: true,
          plan: true,
          status: true,
          periodStart: true,
          periodEnd: true,
          stripeCustomerId: true,
          createdAt: true,
        },
      });

      // build map: stripeCustomerId -> latest subscription
      const subByCustomer = new Map<string, (typeof subscriptions)[number]>();

      for (const sub of subscriptions) {
        if (!sub.stripeCustomerId) continue;
        if (!subByCustomer.has(sub.stripeCustomerId)) {
          subByCustomer.set(sub.stripeCustomerId, sub);
        }
      }

      // attach "subscription" field to each user
      const items = users.map((u) => ({
        ...u,
        subscription: u.stripeCustomerId
          ? subByCustomer.get(u.stripeCustomerId) ?? null
          : null,
      }));

      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      return {
        items,
        total,
        totalPages,
        page,
        pageSize,
      };
    }),
})