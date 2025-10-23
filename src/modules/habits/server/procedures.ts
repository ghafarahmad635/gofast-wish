import { db } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod"; // ✅ use named import, not default
import { habitCreateSchema } from "../schmas";
import { TRPCError } from "@trpc/server";
import { startOfDay } from "date-fns";
import { Prisma } from "@prisma/client";


export const habitsRouter = createTRPCRouter({
  
  getMany: protectedProcedure
  .input(
    z.object({
      frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
    }).optional()
  )
  .query(async ({ ctx, input }) => {
    try {
      const where: Prisma.HabitWhereInput = {
        userId: ctx.auth.user.id,
        ...(input?.frequency ? { frequency: input.frequency } : {}),
      }

      const habits = await db.habit.findMany({
        where,
        include: { completions: true },
        orderBy: { createdAt: "desc" },
      })

      return habits
    } catch (error) {
      console.error("❌ getMany failed:", error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch habits.",
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
