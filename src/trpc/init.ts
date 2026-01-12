import { auth } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { initTRPC, TRPCError } from '@trpc/server';
import { headers } from 'next/headers';
import { cache } from 'react';
export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: 'user_123' };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  // transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in to access this resource.' });
  }
  return next({ ctx: {
      ...ctx,
      auth: session,
    }
  })
})



export const premiumProcedure = (entity: "goals" | "habits") =>
  protectedProcedure.use(async ({ ctx, next }) => {
    const user = ctx.auth.user;

    // 1) User plan (default "free")
    const userPlan = await db.userPlan.findUnique({
      where: { userId: user.id },
      select: { planKey: true },
    });

    const planKey = (userPlan?.planKey ?? "free") as "free" | "standard" | "pro";

    // 2) Load limits from PlanLimit: wishesLimit (goals) + habitsLimit
    const plan = await db.plan.findUnique({
      where: { key: planKey },
      select: {
        limits: {
          select: {
            wishesLimit: true, // goals limit
            habitsLimit: true,
          },
        },
      },
    });

    if (!plan?.limits) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Plan limits are not configured.",
      });
    }

    const limit = entity === "goals" ? plan.limits.wishesLimit : plan.limits.habitsLimit;

    // null means unlimited
    if (limit !== null) {
      const currentCount =
        entity === "goals"
          ? await db.goal.count({ where: { userId: user.id } })
          : await db.habit.count({ where: { userId: user.id } });

      if (currentCount >= limit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You have reached your ${entity} limit for the ${planKey} plan.`,
        });
      }
    }

    return next({
      ctx: {
        ...ctx,
        planKey, // optional
        planLimits: plan.limits, // optional
      },
    });
  });


export const adminProtectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in to access this resource.' });
  }
 
  if (session.user?.role !== "superadmin") {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to access this resource.' });
  }
  return next({ ctx: {
      ...ctx,
      auth: session,
      db
    }
  })
})