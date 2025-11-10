

import { db } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

import z from "zod";


export const addonsRouter  = createTRPCRouter({
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
   
     
    

     getOneById: protectedProcedure
    .input(
      z.object({
       id: z.uuid({ message: "Invalid ID format" }),
      })
    )
    .query(async ({ input, ctx }) => {
      
      const user = ctx.auth.user;
      if (!user)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in.",
        });

      const addon = await db.addOn.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          url: true,
          icon: true,
          category: true,
          isPremium: true,
          isEnabled: true,
          createdAt: true,
        },
      });

      console.log("addon ",addon)

      if (!addon) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Add-on not found.",
        });
      }

      return addon;
    }),
})