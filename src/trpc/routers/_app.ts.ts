
import { habitsRouter } from '@/modules/habits/server/procedures';
import { baseProcedure, createTRPCRouter } from '../init';
import { goalsRouter } from '@/modules/goals/server/procedures';
import { authRouter } from '@/modules/auth/server/procedures';
import { addonsRouter } from '@/modules/addons/server/procedures';
import { adminUsers } from '@/modules/admin-users/server/procedures';

export const appRouter = createTRPCRouter({
 goals:goalsRouter,
 habitsTracker:habitsRouter,
 auth:authRouter,
 addonsRouter:addonsRouter,
 adminUsers:adminUsers

});

export type AppRouter = typeof appRouter;