
import { habitsRouter } from '@/modules/habits/server/procedures';
import { baseProcedure, createTRPCRouter } from '../init';
import { goalsRouter } from '@/modules/goals/server/procedures';
import { authRouter } from '@/modules/auth/server/procedures';
export const appRouter = createTRPCRouter({
 goals:goalsRouter,
 habitsTracker:habitsRouter,
 auth:authRouter
});

export type AppRouter = typeof appRouter;