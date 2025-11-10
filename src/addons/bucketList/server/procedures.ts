import { aiModel } from "@/lib/ai";
import { bucketListIdeaGeneratedSchema } from "@/lib/ai/schemas/bucketListSchema";
import { db } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

import { generateObject } from "ai";
import z from "zod";

export const bucketListRouter  = createTRPCRouter({
    generateIdeas: protectedProcedure
    .input(
      z.object({
        id: z.uuid({ message: "Invalid ID format" }),
        prompt: z.string().min(3, "Prompt is too short"),
        count: z.number().min(1).max(10).default(3),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.auth.user;
      if (!user)
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });

      const addon = await db.addOn.findUnique({
        where: { id: input.id },
        select: {
          name: true,
          systemPrompt: true,
          customPrompt: true,
          defaultCount: true,
          isEnabled: true,
        },
      });
      if (!addon) throw new TRPCError({ code: "NOT_FOUND", message: "Add-on not found" });
      if (!addon.isEnabled)
        throw new TRPCError({ code: "FORBIDDEN", message: "This add-on is currently disabled" });

      const systemPrompt =
        addon.systemPrompt ||
        `You are ${addon.name}, a helpful assistant generating creative ideas.`;

      const effectivePrompt = addon.customPrompt
        ? `${input.prompt}\n\nContext:\n${addon.customPrompt}`
        : input.prompt;

      const count = input.count || addon.defaultCount || 3;
    

      const result = await generateObject({
        model: aiModel,
        system: `${systemPrompt}\nAlways return exactly ${count} items.`,
        prompt: effectivePrompt,
        schema: bucketListIdeaGeneratedSchema,
      });

      return result.object.ideas;
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

      if (!addon) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Add-on not found.",
        });
      }

      return addon;
    }),
})