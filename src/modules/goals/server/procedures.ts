import { db } from "@/lib/prisma";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { goalInsertSchema } from "../schmas";
import z from "zod";

export const goalsRouter=createTRPCRouter({
    getMany:baseProcedure.query(async()=>{
        const goals=await db.goal.findMany({

        })
    //    throw new TRPCError({
    //     code:"FORBIDDEN",
    //     message:"You do not have access to view goals."
    //    })
        return goals;
    }),
    create:protectedProcedure
    .input(goalInsertSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const goal = await db.goal.create({
          data: {
            title: input.title,
            description: input.description,
            category: input.category,
            targetDate: input.targetDate ? new Date(input.targetDate) : null,
            priority: input.priority ? Number(input.priority) : null,
            userId: ctx.auth.user.id,
          },
        });

        return goal;
      } catch (error) {
        console.error("❌ Failed to create goal:", error);

        // Prisma validation or constraint errors
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create goal. Please try again later.",
          cause: error,
        });
      }
    }),
    getOne:protectedProcedure
    .input(z.object({
        id:z.string(),
    }))
    .query(async({input})=>{
        const goal=await db.goal.findUnique({
            where:{
                id:input.id,
            }
        })

        return goal
    })
})