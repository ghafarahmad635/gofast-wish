import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
import { db } from "@/lib/prisma";
import { adminProtectedProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import z from "zod";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

export const adminGoalsCategories = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(20),
        search: z.string().optional().default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;

      const where: Prisma.GoalCategoryWhereInput =
        search && search.trim().length > 0
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { slug: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {};

      const [categories, total] = await Promise.all([
        db.goalCategory.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        db.goalCategory.count({ where }),
      ]);

      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      return {
        items: categories,
        total,
        totalPages,
        page,
        pageSize,
      };
    }),

  getOne: adminProtectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.goalCategory.findUnique({
        where: { id: input.id },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return category;
    }),

  create: adminProtectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(191),
        description: z.string().optional().nullable(),
        slug: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const baseSlug = input.slug ? input.slug : slugify(input.name);

      // check duplicate by name
      const existingByName = await ctx.db.goalCategory.findFirst({
        where: { name: input.name },
      });

      if (existingByName) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A category with this name already exists.",
        });
      }

      // check duplicate by slug
      const existingBySlug = await ctx.db.goalCategory.findUnique({
        where: { slug: baseSlug },
      });

      if (existingBySlug) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A category with this slug already exists.",
        });
      }

      const category = await ctx.db.goalCategory.create({
        data: {
          name: input.name,
          description: input.description ?? null,
          slug: baseSlug,
        },
      });

      return category;
    }),

  update: adminProtectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().min(1).max(191),
        description: z.string().optional().nullable(),
        slug: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.goalCategory.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      const baseSlug = input.slug ? input.slug : slugify(input.name);
      let slug = baseSlug;
      let counter = 1;

      while (true) {
        const conflict = await ctx.db.goalCategory.findFirst({
          where: {
            slug,
            NOT: { id: input.id },
          },
        });
        if (!conflict) break;
        slug = `${baseSlug}-${counter++}`;
      }

      const category = await ctx.db.goalCategory.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description ?? null,
          slug,
        },
      });

      return category;
    }),

  remove: adminProtectedProcedure
    .input(
      z.object({
        id: z.string().cuid(), // fix: must be string().cuid()
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.goalCategory.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      const deleted = await ctx.db.goalCategory.delete({
        where: { id: input.id },
      });

      return deleted;
    }),
});
