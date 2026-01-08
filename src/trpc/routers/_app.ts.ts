
import { habitsRouter } from '@/modules/habits/server/procedures';
import { baseProcedure, createTRPCRouter } from '../init';
import { goalsRouter } from '@/modules/goals/server/procedures';
import { authRouter } from '@/modules/auth/server/procedures';
import { addonsRouter } from '@/modules/addons/server/procedures';
import { adminUsers } from '@/modules/admin-users/server/procedures';
import { adminSubscriptions } from '@/modules/admin-subscription/server/procedures';
import { adminOrders } from '@/modules/admin-orders/server/procedures';
import { adminAddons } from '@/modules/admin-addons/server/procedures';
import { adminGoalsCategories } from '@/modules/admin-goals-categoires/server/procedures';
import { adminDashboard } from '@/modules/admin-dashboard/server/procedures';
import { billing } from '@/modules/upgrade/server/procedures';
import { adminPlansRouter } from '@/modules/adminPlans/server/procedures';

export const appRouter = createTRPCRouter({
 goals:goalsRouter,
 habitsTracker:habitsRouter,
 auth:authRouter,
 addonsRouter:addonsRouter,
 adminUsers:adminUsers,
 adminSubscriptions:adminSubscriptions,
 adminOrders:adminOrders,
 adminAddons:adminAddons,
 adminGoalsCategories:adminGoalsCategories,
 adminDashboard:adminDashboard,
 billing:billing,
 adminPlansRouter:adminPlansRouter

});

export type AppRouter = typeof appRouter;