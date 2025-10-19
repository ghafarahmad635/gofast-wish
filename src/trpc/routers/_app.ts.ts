
import { baseProcedure, createTRPCRouter } from '../init';
import { goalsRouter } from '@/modules/goals/server/procedures';
export const appRouter = createTRPCRouter({
 goals:goalsRouter
});

export type AppRouter = typeof appRouter;