import { db } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { goalInsertSchema, goalUpdateSchema } from "../schmas";
import z from "zod";
import { UTApi } from "uploadthing/server";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
import { Prisma } from "@prisma/client";

const utapi = new UTApi();

export const goalsRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
        status: z.string().nullish(),
        priority: z.string().nullish(),
        sort: z.enum(["asc", "desc"]).default("desc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, status, priority, sort } = input;

      const priorityMap: Record<string, number> = {
        low: 1,
        medium: 2,
        high: 3,
        urgent: 4,
      };

      const where: Prisma.GoalWhereInput = {
        userId: ctx.auth.user.id,

        ...(status && {
          isCompleted:
            status === "completed"
              ? true
              : status === "incomplete"
              ? false
              : undefined,
        }),

        ...(priority && priorityMap[priority]
          ? { priority: priorityMap[priority] }
          : {}),

        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                {
                  category: {
                    OR: [
                      { name: { contains: search, mode: "insensitive" } },
                      { slug: { contains: search, mode: "insensitive" } },
                    ],
                  },
                },
              ],
            }
          : {}),
      };

      const total = await db.goal.count({ where });
      const totalPages = Math.ceil(total / pageSize);

      const items = await db.goal.findMany({
        where,
        include: {
          featuredImage: { select: { url: true } },
          category: {
            select: {
              id: true,
              name: true,
              
            },
          },
        },
        orderBy: { createdAt: sort },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      return { items, total, totalPages, currentPage: page, pageSize };
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      const goals = await db.goal.findMany({
        where: { userId: ctx.auth.user.id },
        include: {
          featuredImage: { select: { url: true } },
          category: {
            select: {
              id: true,
              name: true,
              
            },
          },
        },
      });

      return goals;
    } catch (error) {
      console.error("❌ getAll goals failed:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch all goals.",
      });
    }
  }),

  create: protectedProcedure
    .input(goalInsertSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        console.log("Creating goal with featuredImageId:", input.featuredImageId);

        if (input.categoryId) {
          const existingCategory = await db.goalCategory.findUnique({
            where: { id: input.categoryId },
          });

          if (!existingCategory) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Category not found.",
            });
          }
        }

        const goal = await db.goal.create({
          data: {
            title: input.title,
            description: input.description,
            categoryId: input.categoryId ?? null,
            targetDate: input.targetDate ? new Date(input.targetDate) : null,
            priority: input.priority ? Number(input.priority) : null,
            userId: ctx.auth.user.id,
            featuredImageId: input.featuredImageId ?? null,
          },
          include: {
            featuredImage: true,
            category: {
              select: {
                id: true,
                name: true,
               
              },
            },
          },
        });

        return goal;
      } catch (error) {
        console.error("❌ Failed to create goal:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create goal. Please try again later.",
        });
      }
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const goal = await db.goal.findFirst({
        where: { id: input.id, userId: ctx.auth.user.id },
        include: {
          featuredImage: {
            select: { url: true },
          },
          category: {
            select: {
              id: true,
              name: true,
             
            },
          },
        },
      });

      if (!goal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Goal not found or unauthorized.",
        });
      }

      return goal;
    }),

  update: protectedProcedure
    .input(goalUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        console.log("Updating goal with image ID:", input.featuredImageId);

        const existingGoal = await db.goal.findFirst({
          where: { id: input.id, userId: ctx.auth.user.id },
          include: { featuredImage: true },
        });

        if (!existingGoal) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Goal not found or unauthorized.",
          });
        }

        if (input.categoryId) {
          const existingCategory = await db.goalCategory.findUnique({
            where: { id: input.categoryId },
          });

          if (!existingCategory) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Category not found.",
            });
          }
        }

        let featuredImageId = existingGoal.featuredImageId;

        if (
          input.featuredImageId &&
          input.featuredImageId !== existingGoal.featuredImageId
        ) {
          if (existingGoal.featuredImage) {
            const oldUrl = existingGoal.featuredImage.url;
            const key = oldUrl?.split("/f/")[1];
            if (key) {
              try {
                await utapi.deleteFiles(key);
              } catch (err) {
                console.warn("⚠️ Failed to delete old file:", err);
              }
            }
            await db.media.delete({ where: { id: existingGoal.featuredImage.id } });
          }

          featuredImageId = input.featuredImageId;
        }

        if (!input.featuredImageId && existingGoal.featuredImageId) {
          if (existingGoal.featuredImage?.url) {
            const key = existingGoal.featuredImage.url.split("/f/")[1];
            if (key) {
              try {
                await utapi.deleteFiles(key);
              } catch (err) {
                console.warn("⚠️ Failed to delete old file:", err);
              }
            }
          }

          await db.media.delete({ where: { id: existingGoal.featuredImageId } });
          featuredImageId = null;
        }

        const updatedGoal = await db.goal.update({
          where: { id: input.id },
          data: {
            title: input.title,
            description: input.description,
            categoryId: input.categoryId ?? null,
            targetDate: input.targetDate ? new Date(input.targetDate) : null,
            priority: input.priority ? Number(input.priority) : null,
            featuredImageId,
          },
          include: {
            featuredImage: { select: { url: true } },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        });

        return updatedGoal;
      } catch (error) {
        console.error("❌ Failed to update goal:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update goal. Please try again later.",
        });
      }
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      console.log("🗑️ Attempting to delete goal with ID:", input.id);

      try {
        const goal = await db.goal.findFirst({
          where: { id: input.id, userId: ctx.auth.user.id },
          include: { featuredImage: true },
        });

        if (!goal) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Goal not found or unauthorized.",
          });
        }

        if (goal.featuredImage) {
          const oldUrl = goal.featuredImage.url;
          const key = oldUrl?.split("/f/")[1];

          if (key) {
            try {
              await utapi.deleteFiles(key);
              console.log("✅ Deleted file from UploadThing:", key);
            } catch (err) {
              console.warn("⚠️ Failed to delete file from UploadThing:", err);
            }
          }

          try {
            await db.media.delete({ where: { id: goal.featuredImage.id } });
            console.log("✅ Deleted media record:", goal.featuredImage.id);
          } catch (err) {
            console.warn("⚠️ Failed to delete media record:", err);
          }
        }

        await db.goal.delete({
          where: { id: goal.id },
        });

        console.log("✅ Goal deleted successfully:", goal.id);

        return { success: true, message: "Goal deleted successfully" };
      } catch (error) {
        console.error("❌ Failed to delete goal:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete goal. Please try again later.",
        });
      }
    }),

  getManyByStatus: protectedProcedure
    .input(
      z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(3),
        status: z.enum(["completed", "incomplete"]).default("incomplete"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, status } = input;

      const where: Prisma.GoalWhereInput = {
        userId: ctx.auth.user.id,
        isCompleted: status === "completed",
      };

      const total = await db.goal.count({ where });
      const totalPages = Math.ceil(total / pageSize);

      const data = await db.goal.findMany({
        where,
        include: {
          featuredImage: {
            select: { url: true },
          },
          category: {
            select: {
              id: true,
              name: true,
              
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      return {
        items: data,
        total,
        totalPages,
        currentPage: page,
        pageSize,
        status,
      };
    }),

  getManyLatestForCarousel: protectedProcedure
    .input(
      z.object({
        status: z.enum(["completed", "incomplete"]).default("incomplete"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { status } = input;
      const MAX_CAROUSEL_ITEMS = 10;

      const where: Prisma.GoalWhereInput = {
        userId: ctx.auth.user.id,
        isCompleted: status === "completed",
      };

      const items = await db.goal.findMany({
        where,
        include: {
          featuredImage: {
            select: { url: true },
          },
          category: {
            select: {
              id: true,
              name: true,
              
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: MAX_CAROUSEL_ITEMS,
      });

      return {
        items,
        status,
        count: items.length,
        maxItems: MAX_CAROUSEL_ITEMS,
      };
    }),

  markToggleComplete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const goal = await db.goal.findFirst({
          where: { id: input.id, userId: ctx.auth.user.id },
        });

        if (!goal) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Goal not found or unauthorized.",
          });
        }

        const newState = !goal.isCompleted;

        const updatedGoal = await db.goal.update({
          where: { id: goal.id },
          data: {
            isCompleted: newState,
          },
          include: {
            featuredImage: { select: { url: true } },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        });

        return {
          success: true,
          goal: updatedGoal,
          message: newState
            ? "Goal marked as completed."
            : "Goal marked as incomplete.",
        };
      } catch (error) {
        console.error("❌ Failed to toggle goal state:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to toggle goal completion. Please try again later.",
        });
      }
    }),
});
