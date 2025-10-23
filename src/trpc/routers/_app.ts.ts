
import { habitsRouter } from '@/modules/habits/server/procedures';
import { baseProcedure, createTRPCRouter } from '../init';
import { goalsRouter } from '@/modules/goals/server/procedures';
export const appRouter = createTRPCRouter({
 goals:goalsRouter,
 habitsTracker:habitsRouter
});

export type AppRouter = typeof appRouter;