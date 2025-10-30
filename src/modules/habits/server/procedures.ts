import { db } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod"; // ✅ use named import, not default
import { habitCreateSchema } from "../schmas";
import { TRPCError } from "@trpc/server";
import { startOfDay } from "date-fns";
import { Prisma } from "@prisma/client";

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 3
const MIN_PAGE_SIZE = 1
const MAX_PAGE_SIZE = 50

export const habitsRouter = createTRPCRouter({
  
  getMany: protectedProcedure
    .input(
      z.object({
        habitPage: z.number().default(DEFAULT_PAGE),
        habitPageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        frequency: z.enum(["daily", "weekly", "monthly"]).default("daily"),
        search: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const { habitPage, habitPageSize, frequency } = input
        const search = input?.search?.trim() || ""

        // ✅ Shared filter conditions
        const where: Prisma.HabitWhereInput = {
          userId: ctx.auth.user.id,
          frequency,
          ...(search && {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }),
        }

        // ✅ Total count for pagination
        const total = await db.habit.count({ where })
        const totalPages = Math.ceil(total / habitPageSize)

        // ✅ Paginated query
        const data = await db.habit.findMany({
          where,
          include: { completions: true },
          orderBy: { createdAt: "desc" },
          skip: (habitPage - 1) * habitPageSize,
          take: habitPageSize,
        })

        // ✅ Unified return format
        return {
          items: data,
          total,
          totalPages,
          currentPage: habitPage,
          pageSize: habitPageSize,
        }
      } catch (error) {
        console.error("❌ getMany failed:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch habits.",
        })
      }
    }),

    getManyByFrequency: protectedProcedure
    .input(
      z.object({
        frequency: z.enum(["daily", "weekly", "monthly"]).default("daily"),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const { frequency } = input

        // ✅ Filter by user and frequency only
        const where: Prisma.HabitWhereInput = {
          userId: ctx.auth.user.id,
          frequency,
        }

        // ✅ Return all habits (no pagination)
        const data = await db.habit.findMany({
          where,
          include: { completions: true },
          orderBy: { createdAt: "desc" },
        })

        return data
      } catch (error) {
        console.error("❌ getByFrequency failed:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch habits by frequency.",
        })
      }
    }),

    getManyLatestByFrequency: protectedProcedure
    .input(
      z.object({
        frequency: z.enum(["daily", "weekly", "monthly"]).default("daily"),
      })
    )
    .query(async ({ ctx, input }) => {
      const MAX_HABITS_CAROUSEL_ITEMS = 10
      try {
        const { frequency } = input

        const where: Prisma.HabitWhereInput = {
          userId: ctx.auth.user.id,
          frequency,
        }

        // ✅ Only fetch limited number of habits for carousel
        const data = await db.habit.findMany({
          where,
          include: { completions: true },
          orderBy: { createdAt: "desc" },
          take: MAX_HABITS_CAROUSEL_ITEMS,
        })

        return {
          items: data,
          count: data.length,
          maxItems: MAX_HABITS_CAROUSEL_ITEMS,
        }
      } catch (error) {
        console.error("❌ getLatestByFrequency failed:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch latest habits for carousel.",
        })
      }
    }),



  // ✅ Get a single habit by ID
getOne: protectedProcedure
  .input(z.object({ habitId: z.string() }))
  .query(async ({ ctx, input }) => {
    try {
      const habit = await db.habit.findUnique({
        where: { id: input.habitId, userId: ctx.auth.user.id },
        include: { completions: true },
      })

      if (!habit) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Habit not found or access denied.",
        })
      }

      return habit
    } catch (error) {
      console.error("❌ getOne failed:", error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch habit.",
      })
    }
  }),



 // ✅ Create new habit
create: protectedProcedure
  .input(habitCreateSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      const habit = await db.habit.create({
        data: {
          title: input.title,
          description: input.description,
          frequency: input.frequency,
          startDate: input.startDate
            ? new Date(input.startDate)
            : new Date(),
          userId: ctx.auth.user.id,
        },
      });

      return {
        success: true,
        message: "Habit created successfully.",
        habit,
      };
    } catch (error) {
      console.error("❌ Failed to create habit:", error);

      // Database or validation error fallback
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "Failed to create habit. Please try again later or contact support.",
      });
    }
  }),

  // ✅ Update existing habit
  update: protectedProcedure
    .input(
      habitCreateSchema.extend({
        id: z.string(), // habit ID required for update
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check ownership before updating
        const existingHabit = await db.habit.findUnique({
          where: { id: input.id },
          select: { userId: true },
        });

        if (!existingHabit || existingHabit.userId !== ctx.auth.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not authorized to update this habit.",
          });
        }

        const updatedHabit = await db.habit.update({
          where: { id: input.id },
          data: {
            title: input.title,
            description: input.description,
            frequency: input.frequency,
            startDate: input.startDate ? new Date(input.startDate) : new Date(),
          },
        });

        return {
          success: true,
          message: "Habit updated successfully.",
          habit: updatedHabit,
        };
      } catch (error) {
        console.error("❌ updateHabit failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update habit.",
        });
      }
    }),

    // ✅ Delete habit
    delete: protectedProcedure
      .input(z.object({ habitId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Verify habit belongs to the authenticated user
          const habit = await db.habit.findUnique({
            where: { id: input.habitId },
            select: { userId: true },
          });

          if (!habit || habit.userId !== ctx.auth.user.id) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You are not authorized to delete this habit.",
            });
          }

          // Delete all completions first (optional but cleaner)
          await db.habitCompletion.deleteMany({
            where: { habitId: input.habitId },
          });

          // Delete the habit itself
          await db.habit.delete({
            where: { id: input.habitId },
          });

          return {
            success: true,
            message: "Habit deleted successfully.",
          };
        } catch (error) {
          console.error("❌ deleteHabit failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete habit. Please try again later.",
          });
        }
      }),


   // ✅ Mark as completed
 markDone: protectedProcedure
  .input(
    z.object({
      habitId: z.string(),
      date: z.union([
        z.date(),
        z.string().transform((val) => new Date(val)),
      ]),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const normalizedDate = new Date(input.date)
      normalizedDate.setHours(0, 0, 0, 0)

      await db.habitCompletion.upsert({
        where: {
          habitId_date: {
            habitId: input.habitId,
            date: normalizedDate,
          },
        },
        create: {
          habitId: input.habitId,
          date: normalizedDate,
          status: "completed",
        },
        update: { status: "completed" },
      })

      return { success: true }
    } catch (error) {
      console.error("❌ markDone failed:", error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to mark as completed",
      })
    }
  }),



  // ✅ Mark as skipped
  markSkipped: protectedProcedure
    .input(
    z.object({
      habitId: z.string(),
      date: z.union([
        z.date(),
        z.string().transform((val) => new Date(val)),
      ]),
    })
  )
    .mutation(async ({ ctx, input }) => {
      try {
        const normalizedDate = startOfDay(input.date)
        await db.habitCompletion.upsert({
          where: {
            habitId_date: {
              habitId: input.habitId,
              date: normalizedDate,
            },
          },
          create: {
            habitId: input.habitId,
            date: normalizedDate,
            status: "skipped",
          },
          update: {
            status: "skipped",
          },
        })
        return { success: true }
      } catch (error) {
        console.error("❌ markSkipped failed:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark as skipped",
        })
      }
    }),
     // ✅ Get completions
  getCompletions: protectedProcedure
    .input(z.object({ habitId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const completions = await db.habitCompletion.findMany({
          where: { habitId: input.habitId },
          orderBy: { date: "asc" },
        })
        return completions
      } catch (error) {
        console.error("❌ Error fetching completions:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch completions",
        })
      }
    }),

  resetStatus: protectedProcedure
  .input(
    z.object({
      habitId: z.string(),
      date: z.union([z.date(), z.string().transform((v) => new Date(v))]),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const normalizedDate = startOfDay(new Date(input.date))
    await db.habitCompletion.deleteMany({
      where: {
        habitId: input.habitId,
        date: normalizedDate,
      },
    })
    return { success: true }
  }),

});
