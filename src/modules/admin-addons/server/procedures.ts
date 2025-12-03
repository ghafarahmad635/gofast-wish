import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
import { adminProtectedProcedure, createTRPCRouter } from "@/trpc/init";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { UTApi } from "uploadthing/server";
import z from "zod";
const utapi = new UTApi();
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
            include: { icon: { select: { url: true } } },
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
     getOne: adminProtectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input,ctx }) => {
          return await ctx.db.addOn.findUnique({
            where: { id: input.id },
            include: { 
               icon: {
              select: { url: true },
            },
             },
          });
        }),
  updateMeta: adminProtectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().min(1),
      description: z.string().optional().nullable(),
      isPremium: z.boolean(),
      iconId: z.string().optional().nullable(), // NEW
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { id, name, description, isPremium, iconId } = input;

    // Step 1: Fetch existing addon with its icon
    const existingAddon = await ctx.db.addOn.findUnique({
      where: { id },
      include: { icon: true },
    });

    if (!existingAddon) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Addon not found.",
      });
    }

    let finalIconId: string | null | undefined = existingAddon.iconId;

    // Step 2: Case (a) → New iconId (replace old one)
    if (iconId && iconId !== existingAddon.iconId) {
      // Delete old UploadThing file + Media row
      if (existingAddon.icon) {
        const oldUrl = existingAddon.icon.url;
        const key = oldUrl?.split("/f/")[1];

        if (key) {
          try {
            await utapi.deleteFiles(key);
          } catch (err) {
            console.warn("⚠️ Failed to delete old addon icon file:", err);
          }
        }

        await ctx.db.media.delete({ where: { id: existingAddon.icon.id } });
      }

      finalIconId = iconId;
    }

    // Step 3: Case (b) → User removed icon entirely (no new one)
    if (!iconId && existingAddon.iconId) {
      if (existingAddon.icon?.url) {
        const key = existingAddon.icon.url.split("/f/")[1];
        if (key) {
          try {
            await utapi.deleteFiles(key);
          } catch (err) {
            console.warn("⚠️ Failed to delete old addon icon file:", err);
          }
        }
      }

      await ctx.db.media.delete({ where: { id: existingAddon.iconId } });
      finalIconId = null;
    }

    // Step 4: Update addon record
    const updatedAddon = await ctx.db.addOn.update({
      where: { id },
      data: {
        name,
        description: description?.trim() || null,
        isPremium,
        iconId: finalIconId ?? null,
      },
      include: {
        icon: { select: { url: true } },
      },
    });

    return updatedAddon;
  }),
});
