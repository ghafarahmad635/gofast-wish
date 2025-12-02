import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
import { adminProtectedProcedure, createTRPCRouter } from "@/trpc/init";
import { Prisma } from "@prisma/client";
import z from "zod";

export const adminAddons = createTRPCRouter({
  getMany: adminProtectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        search: z.string().optional().default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;

      const where: Prisma.AddOnWhereInput =
        search && search.trim().length > 0
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { slug: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { category: { contains: search, mode: "insensitive" } },
              ],
            }
          : {};

      const [addons, total] = await Promise.all([
        ctx.db.addOn.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        ctx.db.addOn.count({ where }),
      ]);

      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      return {
        items: addons,
        total,
        totalPages,
        page,
        pageSize,
      };
    }),

     // enable or disable addon
  toggleEnabled: adminProtectedProcedure
    .input(
      z.object({
        id: z.string(),
        isEnabled: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, isEnabled } = input;
      return ctx.db.addOn.update({
        where: { id },
        data: { isEnabled },
      });
    }),
     updateMeta: adminProtectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
       
        description: z.string().optional().nullable(),
       
    
        isPremium: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;

      return ctx.db.addOn.update({
        where: { id },
        data: {
          ...rest,
          description: rest.description?.trim() || null,
         
        },
      });
    }),

  // update prompts only
  updatePrompts: adminProtectedProcedure
    .input(
      z.object({
        id: z.string(),
        systemPrompt: z.string().optional().nullable(),
        customPrompt: z.string().optional().nullable(),
        
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;

      return ctx.db.addOn.update({
        where: { id },
        data: {
          systemPrompt: rest.systemPrompt?.trim() || null,
          customPrompt: rest.customPrompt?.trim() || null,
         
        },
      });
    }),
});
