import { db } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const addOnRouter = createTRPCRouter({
  getMany: protectedProcedure.query(async ({ ctx }) => {
    // ✅ Check if user is authenticated
    const session = ctx.auth.session;
    if (!session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    // ✅ Fetch enabled add-ons
    const addons = await db.addOn.findMany({
      where: {
        isEnabled: true, // only active add-ons
      },
      orderBy: {
        createdAt: "desc", // newest first
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        category: true,
        url: true,
        isPremium: true,
      },
    });

    // ✅ Handle empty state gracefully
    if (!addons.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No add-ons available at the moment.",
      });
    }

    return addons;
  }),
});
