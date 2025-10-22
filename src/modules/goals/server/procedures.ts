import { db } from "@/lib/prisma";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { goalInsertSchema, goalUpdateSchema } from "../schmas";
import z from "zod";
import { UTApi } from "uploadthing/server";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";
import { Prisma } from "@prisma/client";

const utapi = new UTApi();
export const goalsRouter = createTRPCRouter({
  getMany: protectedProcedure
  .input(
    z.object({
      page: z.number().default(DEFAULT_PAGE),
      pageSize: z.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
      search: z.string().nullish(),
    })
  )
  .query(async ({ ctx, input }) => {
    const { page, pageSize } = input;
    const search = input?.search?.trim() || "";

    // ✅ Shared filter conditions
    const where: Prisma.GoalWhereInput = {
      userId: ctx.auth.user.id,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { category: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    // ✅ Total count for pagination
    const total = await db.goal.count({ where });
    const totalPages = Math.ceil(total / pageSize);

    // ✅ Paginated data query
    const data = await db.goal.findMany({
      where,
      include: {
        featuredImage: {
          select: { url: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // ✅ Unified return format
    return {
      items: data,
      total,
      totalPages,
      currentPage: page,
      pageSize,
    };
  }),

  create: protectedProcedure
    .input(goalInsertSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        console.log("Creating goal with featuredImageId:", input.featuredImageId);

        const goal = await db.goal.create({
          data: {
            title: input.title,
            description: input.description,
            category: input.category,
            targetDate: input.targetDate ? new Date(input.targetDate) : null,
            priority: input.priority ? Number(input.priority) : null,
            userId: ctx.auth.user.id,
            featuredImageId: input.featuredImageId ?? null, // ✅ link existing media
          },
          include: { featuredImage: true },
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
    .query(async ({ input }) => {
      return db.goal.findUnique({
        where: { id: input.id },
        include: { 
           featuredImage: {
          select: { url: true },
        },
         },
      });
    }),
     // ✅ Update goal (same schema)
  update: protectedProcedure
  .input(goalUpdateSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      console.log("Updating goal with image ID:", input.featuredImageId);

      // Step 1: Fetch the existing goal
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

      let featuredImageId = existingGoal.featuredImageId;

      // Step 2: Case (a) → Replace with a new image
      if (input.featuredImageId && input.featuredImageId !== existingGoal.featuredImageId) {
        // Delete old file from UploadThing and DB first
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
          // Remove old media record
          await db.media.delete({ where: { id: existingGoal.featuredImage.id } });
        }

        // Assign the new one
        featuredImageId = input.featuredImageId;
      }

      // Step 3: Case (b) → User removed image entirely (no new one)
      if (!input.featuredImageId && existingGoal.featuredImageId) {
        // Remove old UploadThing file
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

        // Remove old DB media record
        await db.media.delete({ where: { id: existingGoal.featuredImageId } });

        featuredImageId = null;
      }

      // Step 4: Update the goal record
      const updatedGoal = await db.goal.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
          category: input.category,
          targetDate: input.targetDate ? new Date(input.targetDate) : null,
          priority: input.priority ? Number(input.priority) : null,
          featuredImageId, // can be null or new one
        },
        include: {
          featuredImage: { select: { url: true } },
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
      // Step 1: Fetch goal with media
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

      // Step 2: If goal has an image, delete from storage and DB
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

      // Step 3: Delete the goal itself
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
    })
  )
  .query(async ({ ctx, input }) => {
    const { page, pageSize, status } = input;

    // ✅ Shared filter logic
    const where: Prisma.GoalWhereInput = {
      userId: ctx.auth.user.id,
      isCompleted: status === "completed",
    };

    // ✅ Total count and pagination setup
    const total = await db.goal.count({ where });
    const totalPages = Math.ceil(total / pageSize);

    // ✅ Query goals with pagination
    const data = await db.goal.findMany({
      where,
      include: {
        featuredImage: {
          select: { url: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // ✅ Return unified format
    return {
      items: data,
      total,
      totalPages,
      currentPage: page,
      pageSize,
      status,
    };
  }),




});
