
import { habitsRouter } from '@/modules/habits/server/procedures';
import { baseProcedure, createTRPCRouter } from '../init';
import { goalsRouter } from '@/modules/goals/server/procedures';
import { authRouter } from '@/modules/auth/server/procedures';
import { bucketListRouter } from '@/addons/bucketList/server/procedures';
import { addOnRouter } from '@/modules/addons-dashboard/server/procedures';
export const appRouter = createTRPCRouter({
 goals:goalsRouter,
 habitsTracker:habitsRouter,
 auth:authRouter,
 bucketListRouter:bucketListRouter,
 addOnRouter:addOnRouter
});

export type AppRouter = typeof appRouter;